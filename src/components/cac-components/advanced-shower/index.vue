<!--created by zyt-->
<!--upated by ljx-->
<!--2021/10/25-->
<!-- 针对select组件，增加"labelInValue"配置项，用于同时获取label和value；-->
<!--upated by ljx-->
<!--2021/12/07-->
<!-- 增加time组件项-->
<!--upated by yuyupeng-->
<!--2023/02/09-->
<!-- 迁移到易研项目中，适配Arco Design、Vue3和TypeScript-->
<template>
  <div>
    <a-button
      v-if="click === 'button'"
      :block="block"
      :disabled="disabled"
      :type="type"
      @click="showDrawer"
    >
      <icon-plus v-if="!icon || icon !== 'empty'" />
      {{ clickword }}
    </a-button>
    <a-button
      v-if="click === 'word'"
      type="text"
      :disabled="disabled"
      @click="showDrawer"
      >{{ clickword }}
    </a-button>
    <a-link
      v-if="click === 'link'"
      type="text"
      :disabled="disabled"
      @click="showDrawer"
    >
      {{ clickword }}
    </a-link>
    <!--  style="z-index: 10; min-height: calc(100vh - 86px)" -->
    <a-drawer
      unmount-on-close
      :visible="visible"
      :title="title"
      :width="wide ? 900 : narrow ? 360 : 720"
      @cancel="onClose"
      @ok="onSubmit"
    >
      <a-form
        ref="drawerForm"
        layout="vertical"
        :model="form"
        :rules="rules"
        :disabled="true"
      >
        <a-row :gutter="24">
          <a-col
            v-for="item in dataSource"
            :key="item.fieldName"
            :span="item.col ? item.col : 12"
          >
            <a-form-item
              v-show="item.hasOwnProperty('visible') ? item.visible : true"
              :label="item.labelText"
              :field="item.fieldName"
            >
              <a-input
                v-if="item.type === 'text' && !item.textrow"
                v-model="form[item.fieldName]"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                :disabled="true"
              />
              <a-textarea
                v-else-if="item.type === 'text' && item.textrow"
                v-model="form[item.fieldName]"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                :disabled="true"
                :auto-size="{ minRows: 1, maxRows: item.textrow }"
              />
              <a-input-number
                v-else-if="item.type === 'number'"
                v-model="form[item.fieldName]"
                :min="item.hasOwnProperty('min') ? item.min : 0"
                :max="item.hasOwnProperty('max') ? item.max : 2147483648"
                :precision="
                  item.hasOwnProperty('precision') ? item.precision : 0
                "
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                :disabled="true"
                @change="(val) => onchangeNumber(val, item.fieldName)"
              />
              <a-select
                v-else-if="item.type === 'select'"
                v-model="form[item.fieldName]"
                :multiple="item.mode === 'multiple'"
                :options="item.options || []"
                :field-names="{
                  value: item.codefield || 'code',
                  label: item.namefield || 'name',
                }"
                :allow-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                "
                :disabled="true"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                @change="(value) => onchangeSelect(value, item.fieldName)"
              >
              </a-select>
              <a-tree-select
                v-else-if="item.type === 'select-tree'"
                v-model="form[item.fieldName]"
                :data="item.data || []"
                :field-names="{
                  key: item.codefield || 'code',
                  title: item.namefield || 'name',
                }"
                :allow-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                "
                :disabled="true"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                @change="(value) => onchangeSelect(value, item.fieldName)"
              ></a-tree-select>
              <!--
              <a-cascader v-else-if="item.type === 'cascader'" :options="item.optionList || []" default-value="chaoyang" expand-trigger="hover" :style="{width:'320px'}"/>
-->
              <a-cascader
                v-else-if="item.type === 'cascader'"
                v-model="form[item.fieldName]"
                :options="item.optionList || []"
                expand-trigger="hover"
                :disabled="true"
                :field-names="
                  item.hasOwnProperty('fieldNames')
                    ? item.fieldNames
                    : {
                        label: 'label',
                        value: 'value',
                        children: 'children',
                      }
                "
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                @change="(value) => onchangeCascade(value, item.fieldName)"
              >
              </a-cascader>
              <a-radio-group
                v-else-if="item.type === 'radioGroup'"
                v-model="form[item.fieldName]"
                :style="item.hasOwnProperty('style') ? item.style : ''"
                :disabled="true"
                :options="item.hasOwnProperty('options') ? item.options : []"
                @change="(value) => onchangeRadioGroup(value, item.fieldName)"
              />
              <dictionary-select
                v-else-if="item.type === 'dictionary'"
                v-model="form[item.fieldName]"
                :disabled="true"
                style="width: 100%"
                :dict-type="item.dictType"
                :init-value="form[item.fieldName]"
                :mode="item.mode ? item.mode : 'default'"
                :allow-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                "
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : false
                "
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                @change="
                  (value) =>
                    onchangeDictSelect(
                      value,
                      item.fieldName,
                      item.mode ? item.mode : 'default'
                    )
                "
              ></dictionary-select>
              <a-date-picker
                v-else-if="item.type === 'datetime'"
                v-model="form[item.fieldName]"
                style="width: 100%"
                :disabled="true"
                :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                :value-format="
                  item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                "
                :show-time="item.showtime"
                @change="
                  (date, dateString) =>
                    onchangeDate(date, dateString, item.fieldName)
                "
              />
              <a-range-picker
                v-else-if="item.type === 'datetimeRange'"
                v-model="form[item.fieldName]"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                :value-format="
                  item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                "
                :show-time="item.showtime"
                :disabled="true"
              />
              <a-time-picker
                v-else-if="item.type === 'time'"
                v-model="form[item.fieldName]"
                :format="item.format ? item.format : 'HH:mm:ss'"
                :step="item.hasOwnProperty('step') ? item.step : {}"
                :placeholder="
                  item.hasOwnProperty('placeholder') ? item.placeholder : '无'
                "
                :disabled="true"
              />
              <a-upload
                v-else-if="item.type === 'file'"
                :file-list="form[item.fieldName]"
                :multiple="item.multiple"
                :remove="(file) => handleRemove(file, item.fieldName)"
                :accept="item.accept"
                :disabled="true"
                @before-upload="
                  (file) => beforeUpload(file, item.fieldName, item.single)
                "
                @change="(info) => onchangeFile(info, item.fieldName)"
              >
                <a-button>
                  {{
                    item.hasOwnProperty('buttonText')
                      ? item.buttonText
                      : '选择文件'
                  }}
                </a-button>
              </a-upload>
              <slot
                v-else-if="item.type === 'other'"
                :name="item.fieldName"
                :form="form"
              ></slot>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-drawer>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import { ref, toRefs, watch, nextTick, onMounted, defineExpose } from 'vue';
  import dayjs from 'dayjs';
  import DictionarySelect from '@/components/cac-components/dictionary-select/index.vue';

  const props = defineProps({
    type: {
      // 控制按钮类型
      type: String,
      default: 'primary',
    },
    click: {
      // 控制使用Button还是a标签进行点击触发
      type: String,
      default: 'word',
    },
    block: {
      // 控制按钮宽度是否和父容器的宽度一样
      type: Boolean,
      default: false,
    },
    clickword: {
      // 点击具体内容
      type: String,
      default: '详情',
    },
    // eslint-disable-next-line vue/require-prop-types
    icon: {
      // 控制按钮图标样式
      default: 'plus',
    },
    title: {
      type: String,
      default: '新增',
    },
    disabled: {
      // 控制按钮是否置灰
      default: false,
      type: Boolean,
    },
    narrow: {
      // 控制抽屉宽度
      default: false,
      type: Boolean,
    },
    wide: {
      // 控制抽屉宽度
      default: false,
      type: Boolean,
    },
    dataSource: {
      // 表单子项信息列表
      type: Array,
      default() {
        return [];
      },
    },
    dataRecord: {
      type: Object,
      default() {
        return {};
      },
    },
    rules: { type: Object, default: () => {} },
  });
  const emits = defineEmits([
    'change',
    'search',
    'editChange',
    'select',
    'close',
    'open',
    'file',
    'date',
    'cascade',
    'radioGroup',
    'dictionary',
    'number',
  ]);
  /**
   * data
   */
  const {
    type,
    click,
    block,
    clickword,
    icon,
    title,
    disabled,
    narrow,
    wide,
    dataSource,
    dataRecord,
    rules,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const visible = ref(false);
  const form = ref<any>({});
  const drawerForm = ref<any>();
  /**
   * func
   */
  /**
   * @method
   * @description 打开抽屉
   */
  const showDrawer = () => {
    visible.value = true;
    emits('open');
  };
  /**
   * @method
   * @param {object} values
   * @description 给表单设置指定值
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setFormValues = (values: any) => {
    // 应传入Json数据(例如:{xx:'a',yy:'b'})，遍历表单项，进行填充<!--created by ljx--><!--2022/03/29-->
    // console.log('-----values', values)
    if (values !== undefined && values !== null) {
      // 排除undefined和null
      nextTick(() => {
        dataSource.value.forEach((element: any) => {
          const { fieldName } = element;
          // console.log('item--', item)
          // console.log('-----values', values)
          if (values.hasOwnProperty.call(fieldName)) {
            form.value[fieldName] = values[fieldName];
          }
        });
      });
    }
  };
  const fillDefault = (elem: any) => {
    if (elem.mode !== 'default') {
      const array: { label: string; key: string }[] = [];
      if (elem.labelInValue) {
        // 针对select组件，增加"labelInValue"配置项，用于同时获取label和value；
        // eslint-disable-next-line no-restricted-syntax
        for (const item of dataRecord.value[elem.fieldName]) {
          const val =
            item &&
            elem.options.find(
              (it: any) => it[elem.codefield] === item[elem.codefield]
            )
              ? { label: item[elem.namefield], key: item[elem.codefield] }
              : undefined;
          if (val) {
            array.push(val);
          }
        }
      } else {
        // console.log(
        //   'select multiple, no label',
        //   this.dataRecord[elem.fieldName]
        // );
        // eslint-disable-next-line no-restricted-syntax
        for (const item of dataRecord.value[elem.fieldName]) {
          const val = elem.options.find(
            (it: any) => it[elem.codefield] === item
          )
            ? item
            : undefined;
          if (val) {
            array.push(val);
          }
        }
      }
      return array;
    }
    let val = dataRecord.value[elem.fieldName];
    // console.log(val);
    if (elem.labelInValue) {
      val =
        val &&
        elem.options.find(
          (it: any) => it[elem.codefield] === val[elem.codefield]
        )
          ? { label: val[elem.namefield], key: val[elem.codefield] }
          : undefined;
    } else {
      val = elem.options.find((it: any) => it[elem.codefield] === val)
        ? val
        : undefined;
    }
    return val;
  };

  /**
   * @method
   * @param {object} item
   * @description 带有dataRecord的情况下初始化表单项
   */
  const setinitial = (item: any) => {
    let val = dataRecord.value[item.fieldName];
    // let data
    // let tempt
    switch (item.type) {
      case 'select':
        item.mode = item.mode || 'default'; // multiple, default
        val = fillDefault(item);
        break;
      case 'select-tree':
        val = val || '';
        break;
      case 'cascader':
        val = val || '';
        break;
      case 'time':
        /* item.format = item.format || 'HH:mm:ss';
        val = dayjs(val, item.format) || null; */
        // 直接解析成 HH:mm:ss是无效的，而且time直接用val即可，不需要格式化
        break;
      case 'datetime':
        val = val || undefined;
        item.showtime = item.showtime || false;
        item.format = item.format || 'YYYY-MM-DD HH:mm:ss';
        val = val ? dayjs(val, item.format) : null;
        break;
      case 'datetimeRange':
        val = val || null;
        item.showtime = item.showtime || false;
        item.format = item.format || 'YYYY-MM-DD';
        break;
      case 'number':
        val = val || 0;
        val = typeof val === 'string' ? parseInt(val, 10) : val;
        break;
      case 'file':
        val = val || [];
        item.single = item.single || false;
        item.accept = item.accept || '';
        item.multiple = item.multiple || false;
        break;
      case 'text':
        val = val || '';
        break;
      case 'other':
        val = val || undefined;
        break;
      default:
        if (Object.prototype.hasOwnProperty.call(item, 'other')) {
          item.type = 'other';
          val = val || undefined;
        } else {
          val = val || '';
          item.type = item.type || 'text';
        }
    }
    form.value[item.fieldName] = val;
    // console.log(item.fieldName, val);
    // console.log(form.value);
  };

  /**
   * @method
   * @param {object} item
   * @description 不带dataRecord的情况下初始化表单项, 用initialValue设置初始值
   */
  const setdefault = (item: any) => {
    let val = Object.prototype.hasOwnProperty.call(item, 'initialValue')
      ? item.initialValue
      : undefined;
    switch (item.type) {
      case 'select':
        item.mode = item.mode || 'default';
        val = item.initialValue || item.mode === 'default' ? undefined : [];
        break;
      case 'select-tree':
        val = item.initialValue || undefined;
        break;
      case 'cascader':
        // eslint-disable-next-line no-restricted-syntax
        for (const it of item.optionList) {
          if (it.children && it.children.length === 0) {
            it.disabled = true;
          }
        }
        val = item.initialValue || [];
        break;
      case 'time':
        val = item.initialValue || null;
        item.format = item.format || 'HH:mm';
        break;
      case 'datetime':
        val = item.initialValue || null;
        item.showtime = item.showtime || false;
        item.format = item.format || 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'datetimeRange':
        val = item.initialValue || null;
        item.showtime = item.showtime || false;
        item.format = item.format || 'YYYY-MM-DD';
        break;
      case 'number':
        val = item.initialValue || 0;
        break;
      case 'file':
        val = item.initialValue || [];
        item.single = item.single || false;
        item.accept = item.accept || '';
        item.multiple = item.multiple || false;
        break;
      case 'text':
        val = item.initialValue || undefined;
        break;
      case 'other':
        val = item.val || undefined;
        break;
      default:
        if (Object.prototype.hasOwnProperty.call(item, 'other')) {
          item.type = 'other';
          val = val || undefined;
        } else {
          val = val || undefined;
          item.type = item.type || 'text';
        }
    }
    form.value[item.fieldName] = val;
  };

  /**
   * @method
   * @description 初始化抽屉
   */
  const drawerInit = () => {
    if (dataRecord.value && Object.keys(dataRecord.value).length > 0) {
      dataSource.value.forEach((elem: any) => {
        elem.type = elem.type || 'text';
        elem.disabled = true;
        setinitial(elem); // 用于修改抽屉
      });
    } else {
      dataSource.value.forEach((elem: any) => {
        elem.type = elem.type || 'text';
        elem.disabled = true;
        setdefault(elem); // 用于新增抽屉
      });
    }
  };
  const drawerRefresh = () => {
    if (dataRecord.value && Object.keys(dataRecord.value).length > 0) {
      // console.log('dataRecord,', dataRecord.value);
      dataSource.value.forEach((elem: any) => {
        elem.disabled = true;
        setinitial(elem);
      });
    } else {
      dataSource.value.forEach((elem: any) => {
        elem.disabled = true;
        if (!form.value[elem.fieldName] || elem.dataRecord) {
          setdefault(elem);
        }
      });
    }
  };

  /**
   * @method
   * @description 格式化返回值
   */
  const setreq = (item: any) => {
    let val: any = '';
    let id;
    // let data
    // let children
    switch (item.type) {
      case 'datetime':
      case 'time':
        val =
          typeof form.value[item.fieldName] !== 'string'
            ? form.value[item.fieldName].format(item.format)
            : form.value[item.fieldName];
        break;
      case 'datetimeRange':
        val = [
          /* form.value[item.fieldName][0].format(item.format),
          form.value[item.fieldName][1].format(item.format), */
          form.value[item.fieldName][0],
          form.value[item.fieldName][1],
        ];
        break;
      case 'select':
        if (item.labelInValue) {
          if (!item.mode || item.mode === 'default') {
            val = form.value[item.fieldName]
              ? {
                  name: form.value[item.fieldName].label,
                  code: form.value[item.fieldName].key,
                }
              : { name: '', code: '' };
          } else {
            const array: any[] = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const elem of form.value[item.fieldName]) {
              const value = elem
                ? {
                    name: elem.label,
                    code: elem.key,
                  }
                : { name: '', code: '' };
              array.push(value);
            }
            val = array;
          }
        } else if (item.mode === 'default') {
          val = form.value[item.fieldName] ? form.value[item.fieldName] : '';
        } else {
          const array: any[] = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const elem of form.value[item.fieldName]) {
            val = elem || '';
            array.push(elem);
          }
          val = array;
        }
        break;
      case 'select-tree':
        val = form.value[item.fieldName] || '';
        break;
      case 'cascader':
        id = form.value[item.fieldName];
        val = id;
        break;
      case 'number':
        val = form.value[item.fieldName].toString();
        break;
      case 'file':
        val = form.value[item.fieldName] || [];
        break;
      default:
        val = form.value[item.fieldName];
    }
    return val;
  };

  /**
   * @method
   * @param {File} file 要上传的文件
   * @param {string} name 字段名
   */
  const handleRemove = (file: any, name: string) => {
    const index = form.value[name].indexOf(file); // 获取file在filelist中的索引
    const newFileList = form.value[name].slice(); // 从数组中选择元素生成新的数组，浅拷贝
    newFileList.splice(index, 1); // 按索引删掉newFileList中的待删文件
    form.value[name] = newFileList; // form表单中的文件属性值更新
  };

  /**
   * @method
   * @param {File} file
   * @param {string} name
   * @param {Boolean} single 是否上传单文件
   * @returns {Boolean}
   */
  const beforeUpload = (file: any, name: string, single = false) => {
    if (single) {
      form.value[name] = [file];
      return false;
    }
    form.value[name] = [...form.value[name], file];
    return false;
  };

  /**
   * @method
   * @description 关闭抽屉
   */
  const onClose = () => {
    visible.value = false;
    drawerForm.value.resetFields(); // 关闭抽屉的时候重置一下表单
    emits('close');
  };

  /**
   * @method
   * @description 点击确认 将表单数据发送给父组件
   */
  const onSubmit = () => {
    let res = true;
    // console.log(form.value);
    drawerForm.value
      .validate(() => {})
      // eslint-disable-next-line consistent-return
      .then((error: any) => {
        if (!error) {
          // console.log('校验通过。。。');
          const reqdata: any = {};
          dataSource.value.forEach((elem: any) => {
            if (
              form.value[elem.fieldName] !== undefined &&
              form.value[elem.fieldName] !== null
            ) {
              reqdata[elem.fieldName] = setreq(elem);
            }
          });
          emits('change', reqdata, (val: boolean) => {
            res = val;
          });
          if (res) {
            onClose();
          }
        } else {
          return false;
        }
      });
  };

  /**
   * @method
   * @description input-number组件值有变化时发送给父组件
   */
  const onchangeNumber = (value: any, name: string) => {
    emits('number', value, name);
  };
  const onchangeCascade = (value: any, name: string) => {
    emits('cascade', value, name);
  };
  const onchangeRadioGroup = (value: any, name: string) => {
    emits('radioGroup', value, name);
  };
  const onchangeDictSelect = (val: any, name: string, mode: string) => {
    if (mode === 'multiple') {
      // 如果是多选的话，val就是[{label:value}]类型的数组
      const dictValues = [] as any[];
      val.forEach((item: any) => {
        dictValues.push(item.value);
      });
      form.value[name] = dictValues;
    } else {
      form.value[name] = val.value;
    }
    emits('dictionary', form.value[name], name);
  };
  const onchangeSelect = (value: any, name: string) => {
    emits('select', value, name);
  };
  const onchangeDate = (value: any, str: string, name: string) => {
    emits('date', value, str, name);
  };
  const onchangeFile = (info: any, name: string) => {
    emits('file', info, name);
  };

  /**
   * onMounted
   */
  onMounted(() => {
    drawerInit();
  });
  /**
   * watch
   */
  watch(
    () => dataRecord,
    (val) => {
      if (Object.keys(val).length !== 0) {
        drawerRefresh();
        drawerInit();
      }
    },
    { deep: true, immediate: true }
  );
  defineExpose({ showDrawer }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
