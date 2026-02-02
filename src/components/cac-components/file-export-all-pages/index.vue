<!--
 * @Author: lxy
 * @Date: 2022-02-19 15:49:55
 * @LastEditors: lxy
 * @LastEditTime: 2023-05-15 10:47:59
 * @Description: 分页数据全量带筛选条件导出
 * @FilePath: \zhuanye-mom(dxe)\src\components\BasicType\CACComponents\FileExportAllPages.vue
-->
<!-- updated by lxy -->
<!-- 2022-02-21：实现分页导出全部数据，加了进度条，参数要传接口url，还可设置一次查询多少条数据-->
<!-- 2022-02-25：导出组件加了searchParams的对应参数，可以筛选后导出 -->
<!-- 2022-10-28: 实现编码字段的中文转换 -->
<!-- 2023-04-20：使用await解决异步导致的数据不全问题，不用设置setTimeout -->
<!-- 2023-10-08：支持button和icon两种样式，支持指定排序字段和排序方式 -->
<!-- 2023-10-16：从DxE搬过来 -->

<template>
  <div>
    <a-button
      v-if="fileExportVisual"
      :id="idName"
      :disabled="disabled"
      @click="exportExcel"
    >
      <StandardIcon :element="{ meta: { icon: icon } }" />{{ clickword }}
    </a-button>
    <div v-if="progressing" :style="progressStyle">
      <p style="margin-bottom: -5px">导出中...</p>
      <a-progress
        style="margin-top: 0"
        :percent="percent"
        :color="{
          '0%': '#108ee9',
          '100%': '#87d068',
        }"
        :status="progStatus"
      />
    </div>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import * as XLSX from 'xlsx';
  import { computed, ref, toRefs, watch } from 'vue';
  import request from '@/utils/request/request';
  import { Notification } from '@arco-design/web-vue';
  import StandardIcon from '@/components/standard-menu/standard-icon.vue';

  const props = defineProps({
    // button word
    clickword: {
      type: String,
      default: '导出',
    },
    // 点击的样式，分为button和icon
    /* click: {
      type: String,
      default: 'button',
    }, */
    // button icon
    icon: {
      type: String,
      default: 'icon-download',
    },
    // button disabled
    disabled: {
      type: Boolean,
      default: false,
    },
    // filename to export
    title: {
      type: String,
      default: '报表',
    },
    // 每次调接口获取数据条数
    pageDataNum: {
      type: Number,
      default: 500,
    },
    // 接口url
    apiUrl: {
      type: String,
      required: true,
    },
    // 接口searchParams的传参（要求按照规范定义的接口）
    searchParamsData: {
      type: Object,
      default() {
        return {};
      },
    },
    // 按什么字段排序
    sidx: {
      type: String,
      default: undefined,
    },
    // 升序asc还是降序desc
    sord: {
      type: String,
      default: undefined,
    },
    // dataSource inside the Json Object that you want to export
    // Excel中的字段配置
    dataSource: {
      type: Array,
      default() {
        return [];
      },
    },
    // 需要进行编码-中文转换的字段
    /** 按照以下格式传递参数
     * 例：
     *[
     *  {
     *    field: 'status',
     *    codeList: [
     *      { name: '状态1', value: '0' },
     *      { name: '状态2', value: '1' },
     *      { name: '状态3', value: '2' }
     *    ]
     *  },
     *  {
     *    field: 'type',
     *    codeList: [
     *      { name: '类型1', value: '0'},
     *      { name: '类型2', value: '1'},
     *      { name: '类型3', value: '2'}
     *    ]
     *  }
     *]
     ** */
    chsDealFields: {
      type: Array,
      default() {
        return [];
      },
    },
  });
  /**
   * data
   */
  const {
    clickword,
    // click,
    icon,
    disabled,
    title,
    pageDataNum,
    apiUrl,
    searchParamsData,
    sidx,
    sord,
    dataSource,
    chsDealFields,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const pageData = ref<any[]>([]); // 单页数据
  const allData = ref<any[]>([]); // 全量数据
  const totalPage = ref<number>(0); // 总页数
  const percent = ref<number>(0); // 导出进度百分比
  const progressStyle = ref<object>({}); // 进度条样式
  const progressing = ref<boolean>(false); // 进度条是否显示
  const fileExportVisual = ref<boolean>(true); // 按钮是否显示
  const progStatus = ref<string>('normal'); // 进度条状态
  /**
   * computed
   */
  const idName = computed(() => {
    // unique identifier
    const now = new Date().getTime();
    return `export_${now}`;
  });
  /**
   * watch
   */
  watch(
    () => dataSource,
    (val) => {
      if (val) {
        val.value.forEach((element: any) => {
          if (element.type === 'select') {
            element.callback = (ele: any) => {
              return getOption(ele, element.options);
            };
          } else if (element.type === 'date') {
            element.callback = (ele: any) => {
              return formatDate(ele, element.fmt);
            };
          } else if (element.type === 'utcdate') {
            element.callback = (ele: any) => {
              return utc2beijing(ele, element.fmt);
            };
          } else if (element.type === 'dictionary') {
            element.callback = (ele: any) => {
              if (ele.name) {
                return ele.name;
              }
              return ele;
            };
          }
        });
      }
    },
    { deep: true, immediate: true }
  );
  /**
   * fun
   */
  const getData = (data: any, type: string) => {
    // 接口request
    if (type === 'get') {
      return request.get(apiUrl?.value, {
        params: data,
      });
    }
    // post方法
    return request.post(apiUrl?.value, data);
  };
  const getDataFromBack = (
    pageNumber: number,
    pageSize: number,
    searchParams: object
  ) => {
    // 调用接口获取单页数据
    return new Promise((resolve, reject) => {
      const req = {
        page: pageNumber,
        limit: pageSize,
        ...searchParams,
      } as any;
      if (sidx?.value) {
        // 按什么字段排序
        req.sidx = sidx.value;
      }
      if (sord?.value) {
        // 升序（asc）/降序（desc）
        req.sord = sord.value;
      }
      getData(req, 'get')
        .then((res: any) => {
          if (res.code === 200) {
            const { data } = res;
            // 转换
            const initPageData = data.list;
            initPageData.forEach((item: any) => {
              // item：导出数据中的一条
              chsDealFields.value.forEach((element: any) => {
                // element：要转换的一个字段
                if (item[element.field]) {
                  if (element.codeList && element.codeList.length > 0) {
                    element.codeList.forEach((ele: any) => {
                      // ele：转换的那个字段中的每个编码及其对应中文
                      if (item[element.field] === ele.value) {
                        item[element.field] = ele.name;
                      }
                    });
                  }
                }
              });
            });
            pageData.value = initPageData; // 单页数据
            allData.value.splice(0, 0, ...pageData.value); // 逐页将获取到的数据合并
            if (pageNumber < totalPage.value) {
              percent.value = Number((pageNumber / totalPage.value).toFixed(1));
            } else if (pageNumber === totalPage.value) {
              percent.value = 1;
            }
            resolve(res);
          } else {
            Notification.error({
              title: '获取数据失败，请刷新重试！',
              content: res.message,
            });
            reject();
          }
        })
    });
  };
  const getAllData = () => {
    // 循环调用接口获取所有页数据
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 调第一页接口获取页数和第一页数据
      const res1 = (await getDataFromBack(
        1,
        pageDataNum.value,
        searchParamsData?.value
      )) as any;
      totalPage.value = Math.ceil(res1.data.total / pageDataNum.value); // 总页数
      if (totalPage.value && totalPage.value !== 0) {
        // eslint-disable-next-line no-plusplus
        for (let i = 2; i < totalPage.value + 1; i++) {
          // eslint-disable-next-line no-await-in-loop
          await getDataFromBack(i, pageDataNum.value, searchParamsData.value);
        }
        resolve(true);
      } else {
        Notification.error({
          title: '获取数据失败，请刷新重试！',
          content: res1.message,
        });
        reject();
      }
    });
  };
  const exportExcel = async () => {
    // 处理导出
    // 设置按钮和进度条的样式：获取宽高并设置，使两种状态大小一致
    const button = document.getElementById(idName.value) as any;
    const progressWidth = button.offsetWidth;
    const progressHeight = button.offsetHeight;
    progressStyle.value = {
      width: `${progressWidth}px`,
      height: `${progressHeight}px`,
      marginBottom: '-5px',
      fontSize: '10px',
    };
    // 点击导出后变为进度条
    progressing.value = true;
    fileExportVisual.value = false;
    // 每次点击导出按钮时都先把上次的数据清一下
    allData.value = [];
    percent.value = 0;
    progStatus.value = 'active';
    // 获取所有数据
    await getAllData();
    // 数据表格
    const table = [];
    const column = {} as any;
    const header = [] as any[];
    dataSource.value.forEach((element: any, index: number) => {
      // console.log('key+index', element.key + String(index))
      column[element.key + String(index)] = element.title;
      header.push(element.key + String(index));
    });
    table.push(column);
    allData.value.forEach((item) => {
      const row = {} as any;
      dataSource.value.forEach((element: any, index: number) => {
        let rowvalue = '';
        if (element.callback) {
          rowvalue = getValueFromCallback(item, element.key, element.callback);
        } else {
          rowvalue = item[element.key];
        }
        const defaultvalue = element.defaultvalue || '';
        row[element.key + String(index)] = parseValue(rowvalue, defaultvalue);
      });
      table.push(row);
    });
    // 创建book
    const wb = XLSX.utils.book_new();
    // json转sheet
    const ws = XLSX.utils.json_to_sheet(table, {
      header,
      skipHeader: true,
    }) as any;
    // 设置列宽
    const colWidths = []; // 记录列宽
    const colNames = Object.values(table[0]); // 所有列的名称数组
    // console.log('列名list', colNames)
    // 计算每一列列名的单元格宽度
    // 列序号
    let index = 0;
    // 遍历列
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in colNames) {
      if (colWidths[index] == null) colWidths[index] = [];
      // 计算列宽
      colWidths[index] = getCellWidth(colNames[key] as string);
      // eslint-disable-next-line no-plusplus
      index++;
    }
    // console.log('colWidths', colWidths)
    ws['!cols'] = [];
    // 每一列设置列宽
    colWidths.forEach((width) => {
      ws['!cols'].push({ wch: width });
    });
    // ws['!cols'] = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 10 }]
    // sheet写入book
    XLSX.utils.book_append_sheet(wb, ws, 'file');
    // 输出
    XLSX.writeFile(wb, `${title.value}.xlsx`);
    // 输出后设置percent为1
    percent.value = 1;
    progStatus.value = 'success';
    // 成功后稍等再退回初始的按钮状态
    setTimeout(() => {
      fileExportVisual.value = true;
      progressing.value = false;
    }, 2000);
  };
  const getValueFromCallback = (item: any, key: string, callback: any) => {
    if (typeof callback !== 'function') return '';
    // eslint-disable-next-line no-nested-ternary
    const value = key ? (item[key] ? callback(item[key]) : '') : callback(item);
    return value;
  };
  const parseValue = (value: any, defaultvalue: any) => {
    return value || value === 0 || typeof value === 'boolean'
      ? value
      : defaultvalue;
  };
  /**
   * 根据列名设置列宽
   */
  const getCellWidth = (value: string) => {
    // 判断是否为null或undefined
    if (value == null) {
      return 10;
    }
    if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
      // 中文的长度
      const chineseLength = value?.match(/[\u4e00-\u9fa5]/g)?.length as number;
      // 其他不是中文的长度
      const otherLength = value.length - chineseLength;
      return chineseLength * 2.1 + otherLength * 1.1;
    }
    return value.toString().length * 1.1;
    /* 另一种方案
  value = value.toString()
  return value.replace(/[\u0391-\uFFE5]/g, 'aa').length
  */
  };
  /**
   * 日期格式转换
   *
   * @param {date|number} time 日期
   * @param {string} fmt 要转换为的格式，默认 yyyy-MM-dd
   */
  const utc2beijing = (time: any, fmt: string) => {
    fmt = fmt || 'yyyy-MM-dd';
    const data = time.substr(0, 19);
    const newDate =
      new Date(data.replace(/T/g, ' ').replace(/-/g, '/')).getTime() +
      8 * 60 * 60 * 1000;
    const date = new Date(newDate);
    return formatDate(date, fmt);
  };
  const formatDate = (date: any, fmt: string) => {
    fmt = fmt || 'yyyy-MM-dd';
    date = date === undefined ? new Date() : new Date(date);
    date = typeof date === 'number' ? new Date() : new Date(date);
    const obj = {
      y: date.getFullYear(), // 年份，注意必须用getFullYear
      M: date.getMonth() + 1, // 月份，注意是从0-11
      d: date.getDate(), // 日期
      q: Math.floor((date.getMonth() + 3) / 3), // 季度
      w: date.getDay(), // 星期，注意是0-6
      H: date.getHours(), // 24小时制
      h: date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 12小时制
      m: date.getMinutes(), // 分钟
      s: date.getSeconds(), // 秒
      S: date.getMilliseconds(), // 毫秒
    } as any;
    const week = ['天', '一', '二', '三', '四', '五', '六'];
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const i in obj) {
      fmt = fmt.replace(new RegExp(`${i}+`, 'g'), function (m) {
        let val = `${obj[i]}` as any;
        if (i === 'w') return (m.length > 2 ? '星期' : '周') + week[val];
        // eslint-disable-next-line no-plusplus
        for (let j = 0, len = val.length; j < m.length - len; j++)
          val = `0${val}`;
        return m.length === 1 ? val : val.substring(val.length - m.length);
      });
    }
    return fmt;
  };
  const getOption = (value: any, options: any) => {
    let option = '';
    const selected = options.filter(
      (item: any) => item.value.toString() === value.toString()
    );
    if (selected.length === 1) {
      option = selected[0].label;
    }
    return option;
  };
</script>
