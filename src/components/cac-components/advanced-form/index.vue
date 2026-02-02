<!-- 表单组件 （参考宇婷的AdvancedDrawer组件）-->
<!--created by ljx-->
<!--2021/11/14-->
<!--传入表单配置项items，遍历并根据type生成相应表单项-->
<!-- 功能：
    1、传参如下：
    （1）items：表单配置项
    2、回调函数，用于监听表单的变化:
    （1）onChange：透出为@change
    3、外部操作表单思路：通过ref取得定义组件名为xxx内表单对象formObject，参考Antd官网表单相关API进行操作，例如：
    （1）外部修改表单值：this.$refs.xxx.formObject.setFieldsValue({ xxx: 'xxx' ,yyy: 'yyy'})
    （2）外部传入变量record，初始化表单值：this.$refs.xxx.setFormValues(record)
    （3）外部获取表单值：
          单项：this.$refs.xxx.formObject.getFieldValue('xxx' )
          多项：this.$refs.xxx.formObject.getFieldsValue(['xxx' ,'yyy'] )
    （3）外部校验表单值：this.$refs.xxx.formObject.validateFields((errors, values) => {})
    （4）外部重置表单值：this.$refs.xxx.formObject.resetFields()   【initialValue有值时，会重置为initialValue】
-->
<!--updated by ljx-->
<!--2021/12/07-->
<!-- 增加TimePicker组件项-->
<!--updated by ljx-->
<!--2022/01/10-->
<!-- 新增属性及功能：
    1、每个子组件增加ref属性，设置为对应fieldName；(需求:便于设置组件的焦点focus)
    2、为文本框增加回车回调函数：透出为@pressEnter
    3、onChange方法更新：针对文本框点击x清空时，设置焦点
-->
<!--updated by ljx-->
<!--2022/04/02-->
<!-- 新增ApiSelectByLjx可配置组件项 -->
<!--updated by ljx-->
<!--2022/04/10-->
<!-- 新增属性及功能：
    1、增加 labelTextBold 参数，控制表单项标签是否加粗；
    2、增加 layout、labelCol 和 wrapperCol 参数，共同控制表单的布局，实现 vertical【垂直】 和 horizontal【水平】 2类布局；
    3、增加3类可配置组件项：【复选框】、【单选框】和【开关】；
      （注，在a-form中layout默认为horizontal，当设置了labelCol和wrapperCol后，会变为【水平】布局，未设置时则为【垂直】显示；）
      （为什么不通过a-form中layout的vertical来控制布局？因为该设置下，通过a-row来控制布局排列有问题，例如多选模式的select、复选框等）
-->
<!--updated by ljx-->
<!--2022/04/24-->
<!-- 新增colon配置项 -->
<!--updated by ljx-->
<!--2022/04/26-->
<!-- 新增upload可配置组件项 -->
<!--updated by ljx-->
<!--2022/06/30-->
<!-- setFormValues函数修改：对设置null值情况判断，转化为undefined -->
<!--updated by ljx-->
<!--2022/07/18-->
<!-- 新增divider分割线配置项；表单项visible参数从 a-form-item 上移至 a-col -->
<!--upated by yuyupeng-->
<!--2023/02/23-->
<!-- 原通途项目中崛雄哥写的的FormByLjx组件迁移到易研项目中，适配Arco Design、Vue3和TypeScript-->
<template>
  <div class="ljx-form" :style="cssVars">
    <!-- Form表单 -->
    <a-form
      ref="formObject"
      :layout="layout"
      :rules="rules"
      :model="form"
      :show-colon="colon"
    >
      <!-- 一行长度24 -->
      <a-row :gutter="24">
        <!-- 遍历表单项，并设置单项长度 -->
        <template v-for="item in items" :key="item.fieldName">
          <!-- col参数设置：1、visible看是否隐藏；2、offset 左边偏移量-->
          <a-col
            v-show="item.hasOwnProperty('visible') ? item.visible : true"
            :span="item.span ? item.span : 12"
            :offset="item.offset ? item.offset : 0"
          >
            <!-- 表单项参数：1、labelText 设置 label 标签的文本；2、设置labelCol与wrapperCol参数；-->
            <a-form-item
              :label="item.labelText"
              :field="item.fieldName"
              :label-col-props="
                layout === 'horizontal'
                  ? item.labelCol
                    ? item.labelCol
                    : labelCol
                  : undefined
              "
              :wrapper-col-props="
                layout === 'horizontal'
                  ? item.wrapperCol
                    ? item.wrapperCol
                    : wrapperCol
                  : undefined
              "
              style="width: 100%"
              :show-colon="item.hasOwnProperty('colon') ? item.colon : colon"
              :rules="item.hasOwnProperty('rules') ? item.rules : undefined"
            >
              <!-- 文本输入框-Input || textarea；通过autoSize判断使用input还是textarea；-->
              <a-input
                v-if="item.type === 'text' && !item.autoSize"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : true
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请输入'
                "
                :max-length="
                  item.hasOwnProperty('maxLength') ? item.maxLength : 524288
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <a-textarea
                v-else-if="item.type === 'text' && item.autoSize"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : true
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请输入'
                "
                :max-length="
                  item.hasOwnProperty('maxLength') ? item.maxLength : 524288
                "
                :auto-size="
                  item.hasOwnProperty('autoSize') ? item.autoSize : false
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 数字输入框-InputNumber -->
              <a-input-number
                v-else-if="item.type === 'number'"
                v-model="form[item.fieldName]"
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请输入'
                "
                :size="item.hasOwnProperty('size') ? item.size : 'default'"
                :formatter="
                  item.hasOwnProperty('formatter')
                    ? item.formatter
                    : (value:any) => `${value}`
                "
                :parser="
                  item.hasOwnProperty('parser') ? item.parser : (value:any) => value
                "
                :min="item.hasOwnProperty('min') ? item.min : 0"
                :max="item.hasOwnProperty('max') ? item.max : 2147483648"
                :step="item.hasOwnProperty('step') ? item.step : 1"
                :precision="
                  item.hasOwnProperty('precision') ? item.precision : 0
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 下拉框-Select -->
              <a-select
                v-else-if="item.type === 'select'"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : false
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请选择'
                "
                :options="item.hasOwnProperty('options') ? item.options : []"
                :multiple="item.mode === 'multiple'"
                :size="item.hasOwnProperty('size') ? item.size : 'medium'"
                :allow-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : false
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 级联选择-Cascader -->
              <a-cascader
                v-else-if="item.type === 'cascader'"
                v-model="form[item.fieldName]"
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请选择'
                "
                :options="item.options"
                :field-names="
                  item.hasOwnProperty('fieldNames')
                    ? item.fieldNames
                    : {
                        label: 'label',
                        value: 'value',
                        children: 'children',
                      }
                "
                :expand-trigger="
                  item.hasOwnProperty('expandTrigger')
                    ? item.expandTrigger
                    : 'hover'
                "
                :allow-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 字典选择-dictionary -->
              <dictionary-select
                v-else-if="item.type === 'dictionary'"
                v-model="form[item.fieldName]"
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
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
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请选择'
                "
                @change="
                  (value) =>
                    onchangeDictSelect(
                      value,
                      item.fieldName,
                      item.mode ? item.mode : 'default'
                    )
                "
              >
              </dictionary-select>
              <!-- 日期组件-DatePicker -->
              <a-date-picker
                v-else-if="item.type === 'date'"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : true
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : '请选择时间'
                "
                :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                :value-format="
                  item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                "
                :show-time="
                  item.hasOwnProperty('showTime') ? item.showTime : true
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 日期组件-RangePicker -->
              <a-range-picker
                v-else-if="item.type === 'dateRange'"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : true
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : ['开始日期', '结束日期']
                "
                :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                :value-format="
                  item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                "
                :show-time="
                  item.hasOwnProperty('showTime') ? item.showTime : true
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 时间组件-TimePicker -->
              <a-time-picker
                v-else-if="item.type === 'time'"
                v-model="form[item.fieldName]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : true
                "
                :style="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请选择'
                "
                :format="item.format ? item.format : 'HH:mm:ss'"
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 自定义下拉框-数据字典 -->
              <!-- 自定义下拉框-带API的select -->
              <!--              <ApiSelectByLjx
                v-else-if="item.type === 'apiSelect'"
                :ref="item.fieldName"
                v-decorator="[
                  item.fieldName,
                  {
                    initialValue: item.hasOwnProperty('initialvalue')
                      ? item.initialvalue
                      : undefined,
                    rules: [
                      {
                        required: item.hasOwnProperty('required')
                          ? item.required
                          : false,
                        message: item.hasOwnProperty('message')
                          ? item.message
                          : '请选择',
                      },
                    ],
                  },
                ]"
                :allow-clear="
                  item.hasOwnProperty('allowClear') ? item.allowClear : false
                "
                :style-config="
                  item.hasOwnProperty('style') ? item.style : 'width: 100%'
                "
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :placeholder="
                  item.hasOwnProperty('placeholder')
                    ? item.placeholder
                    : item.disabled || !formEditable
                    ? '无'
                    : '请选择'
                "
                :api="item.api"
                :method="item.hasOwnProperty('method') ? item.method : 'post'"
                :request-params="
                  item.hasOwnProperty('requestParams')
                    ? item.requestParams
                    : { searchParams: {} }
                "
                :search-by-page="
                  item.hasOwnProperty('searchByPage')
                    ? item.searchByPage
                    : false
                "
                :filed-name-of-key="item.fieldNameOfKey"
                :filed-name-of-label="item.fieldNameOfLabel"
                :label-splice-key="
                  item.hasOwnProperty('labelSpliceKey')
                    ? item.labelSpliceKey
                    : false
                "
                :key-splice-label="
                  item.hasOwnProperty('keySpliceLabel')
                    ? item.keySpliceLabel
                    : false
                "
                :delimiter="
                  item.hasOwnProperty('delimiter') ? item.delimiter : '—'
                "
                :label-in-value="
                  item.hasOwnProperty('labelInValue')
                    ? item.labelInValue
                    : false
                "
                :show-search="
                  item.hasOwnProperty('allowSearch') ? item.allowSearch : false
                "
                :mode="item.mode ? item.mode : 'default'"
              />-->
              <!-- 复选框组件-CheckBoxGroup -->
              <a-checkbox-group
                v-else-if="item.type === 'checkboxGroup'"
                v-model="form[item.fieldName]"
                :style="item.hasOwnProperty('style') ? item.style : ''"
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :options="item.hasOwnProperty('options') ? item.options : []"
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 开关组件-Switch -->
              <a-switch
                v-else-if="item.type === 'switch'"
                v-model="form[item.fieldName]"
                :style="item.hasOwnProperty('style') ? item.style : ''"
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 单选框-RadioGroup -->
              <a-radio-group
                v-else-if="item.type === 'radioGroup'"
                v-model="form[item.fieldName]"
                :style="item.hasOwnProperty('style') ? item.style : ''"
                :disabled="
                  formEditable
                    ? item.hasOwnProperty('disabled')
                      ? item.disabled
                      : false
                    : true
                "
                :options="item.hasOwnProperty('options') ? item.options : []"
                @change="(e) => onchange(item.fieldName, e)"
              />
              <!-- 上传组件-Upload -->
              <a-upload
                v-else-if="item.type === 'file'"
                :file-list="form[item.fieldName]"
                :multiple="item.multiple"
                :accept="item.accept"
                :disabled="item.disabled"
                :auto-upload="false"
                :custom-request="customRequest"
                @change="(e) => onchange(item.fieldName, e)"
              >
                <a-button>
                  {{
                    item.hasOwnProperty('buttonText')
                      ? item.buttonText
                      : '选择文件'
                  }}
                </a-button>
              </a-upload>
              <!-- 分割线 -->
              <a-divider
                v-else-if="item.type === 'divider'"
                style="margin-top: 0; margin-bottom: 0"
                :orientation="
                  item.hasOwnProperty('orientation') ? item.orientation : 'left'
                "
                >{{
                  item.hasOwnProperty('title') ? item.title : '分割线'
                }}</a-divider
              >
              <CacDivider
                v-else-if="item.type === 'cacDivider'"
                :title="item.hasOwnProperty('title') ? item.title : ''"
                :background-color="
                  item.hasOwnProperty('backgroundColor')
                    ? item.backgroundColor
                    : '#eaedf4'
                "
                :prefix-color="
                  item.hasOwnProperty('prefixColor')
                    ? item.prefixColor
                    : '#165dff'
                "
              >
              </CacDivider>
              <!-- 插槽-其他 -->
              <slot
                v-else-if="item.type === 'other'"
                :name="item.fieldName"
                :form="form"
              ></slot>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </a-form>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import DictionarySelect from '@/components/cac-components/dictionary-select/index.vue';
  import CacDivider from '@/components/cac-components/cac-divider/index.vue';
  import type { PropType } from 'vue';

  /* import ApiSelectByLjx from '@/components/BasicType/CACComponents/SubComponents/ApiSelectByLjx'; */

  import { ref, toRefs, computed, onMounted, defineExpose } from 'vue';

  const props = defineProps({
    items: { type: Array<any>, default: () => [] }, // 表单项配置
    initialValues: { type: Object, default: () => undefined }, // 表单值初值
    editable: { type: Boolean, default: true }, // 表单可编辑状态
    rules: { type: Object, default: () => {} },
    labelTextBold: { type: Boolean, default: false }, // 表单项标签是否加粗
    // 表单项总长划分24份，标签占比labelCol份
    labelCol: {
      type: Object,
      default: () => {
        return { span: 8 };
      },
    },
    // 表单项总长划分24份，内容占比wrapperCol份
    wrapperCol: {
      type: Object,
      default: () => {
        return { span: 16 };
      },
    },
    // 布局参数：vertical || horizontal
    layout: {
      type: [String, undefined] as PropType<
        'vertical' | 'inline' | 'horizontal' | undefined
      >,
      default: () => 'vertical',
    },
    colon: { type: Boolean, default: true }, // 表单项标题是否带冒号
    // 文件上传的url
    url: { default: '', type: String },
  });
  const emits = defineEmits(['change']);
  /**
   * data
   */
  const {
    items, // 表单项配置
    initialValues, // 表单值初值
    editable, // 表单可编辑状态
    rules,
    labelTextBold, // 表单项标签是否加粗
    labelCol, // 表单项总长划分24份，标签占比labelCol份
    wrapperCol, // 表单项总长划分24份，内容占比wrapperCol份
    layout, // 布局参数：vertical || horizontal
    colon, // 表单项标题是否带冒号
    url, // 文件上传的url
  } = toRefs(props); // 根据props创建多个 ref 对象
  const formEditable = ref<boolean>();
  const form = ref<any>({});
  const formObject = ref<any>();
  /**
   *
   */
  const cssVars = computed(() => {
    return {
      '--label-weight': labelTextBold.value ? 'bold' : 'nomal', // 控制标签加粗
      '--label-height': layout.value === 'vertical' ? '20px' : '40px', // 控制2种布局下，标签的行间距
    };
  });
  /**
   * fun
   */
  /**
   * @method
   * @param values
   * @description 给表单设置指定值
   */
  const setFormValues = (values: any) => {
    // 应传入Json数据(例如:{xx:'a',yy:'b'})，遍历表单项，进行填充
    if (values !== undefined && values !== null) {
      // 排除undefined和null
      items.value.forEach((item: any) => {
        const { fieldName } = item as any;
        // console.log('item--', item)
        // console.log('-----values', values)
        if (values[fieldName] !== undefined && values[fieldName] !== null) {
          // console.log(values[fieldName]);
          form.value[fieldName] = values[fieldName];
        }
      });
    }
  };
  /**
   * @description 表单发生改变
   * @param value
   * @param name
   */
  const onchange = (name: string, value: any) => {
    // 表单变化回调函数
    /* if (value === '') {
      // 针对【文本框】点击x清空时，设置焦点
      this.$refs[fieldName][0].focus();
    } */
    emits('change', name, value);
  };
  /**
   * @description 数据字典组件发生改变，因为数据字典无法直接v-model，所以要专门写个onchange方法来和form绑定
   * @param value
   * @param name
   */
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
    emits('change', form.value[name], name);
  };
  /**
   * @method
   * @description uploade组件自定义的上传请求参数
   */
  const customRequest = (option: any) => {
    const { onProgress, onError, onSuccess, fileItem } = option;
    const xhr = new XMLHttpRequest();
    if (xhr.upload) {
      xhr.upload.onprogress = (event: any) => {
        let percent;
        if (event.total > 0) {
          // 0 ~ 1
          percent = event.loaded / event.total;
        }
        onProgress(percent, event);
      };
    }
    xhr.onerror = function error(e) {
      onError(e);
    };
    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return onError(xhr.responseText);
      }
      return onSuccess(xhr.response);
    };

    const formData = new FormData();
    formData.append('file', fileItem.file);
    xhr.open('post', url.value, true);
    xhr.send(formData);

    return {
      abort() {
        xhr.abort();
      },
    };
  };
  /**
   * onMounted
   */
  onMounted(() => {
    formEditable.value = editable.value; // 控制整个表单的可编辑状态，外部可通过ref修改
    setFormValues(initialValues?.value); // 初始赋值
  });
  defineExpose({ setFormValues, formObject, form }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>

<style scoped>
  .ljx-form >>> .ant-form-item-label {
    /* line-height: 1.1em !important */
    line-height: var(--label-height);
  }

  .ljx-form >>> label {
    font-weight: var(--label-weight);
  }
</style>
