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
      <template v-if="!icon || icon !== 'empty'" #icon>
        <slot name="icon">
          <!-- 父组件中不写入插槽时会显示以下内容： -->
          <icon-plus />
        </slot>
      </template>
      {{ clickword }}
    </a-button>
    <a-button
      v-if="click === 'word'"
      type="text"
      :disabled="disabled"
      @click="showDrawer"
    >
      {{ clickword }}
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
      :width="wide ? 900 : narrow ? 360 : 720"
      @cancel="onClose"
      @ok="onSubmit"
    >
      <template #title>
        <slot name="title">
          {{ title }}
        </slot>
      </template>
      <a-spin :loading="submitting" style="width: 100%">
        <a-form
          ref="drawerForm"
          layout="vertical"
          :model="form"
          :rules="rules"
          :disabled="!editable"
        >
          <a-row :gutter="24">
            <!-- show-secret-level选项为true时，表单提供额外一个密级选择字段 -->
            <a-col
              v-if="showSecretLevel"
              :span="(dataSource[0] as any)?.col ? (dataSource[0] as any).col : 12"
            >
              <a-form-item
                label="密级"
                field="secretLevel"
                :rules="[{ required: true, message: '请选择密级' }]"
              >
                <SecretLevelSelect
                  v-model="form.secretLevel"
                  :default-value="form.secretLevel"
                  style="width: 100%"
                  @change="onchangeSecret"
                />
              </a-form-item>
            </a-col>

            <!--普通字段-->
            <a-col
              v-for="item in dataSource as any[]"
              :key="item.fieldName"
              :span="item.col ? item.col : 12"
            >
              <a-form-item
                v-show="item.hasOwnProperty('visible') ? item.visible : true"
                :label="item.labelText"
                :rules="
                  item.hasOwnProperty('required')
                    ? [{ required: true, message: `请填写${item.labelText}` }]
                    : undefined
                "
                :field="item.fieldName"
              >
                <a-input
                  v-if="item.type === 'text' && !item.textrow"
                  v-model="form[item.fieldName]"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请输入'
                      : '无'
                  "
                  :disabled="item.disabled"
                />
                <a-textarea
                  v-else-if="item.type === 'text' && item.textrow"
                  v-model="form[item.fieldName]"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请输入'
                      : '无'
                  "
                  :disabled="item.disabled"
                  :auto-size="{ minRows: 5, maxRows: 5 }"
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
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请输入'
                      : '无'
                  "
                  :disabled="item.disabled"
                  @change="(val) => onchangeNumber(val, item.fieldName)"
                />
                <a-input-password
                  v-if="item.type === 'password'"
                  v-model="form[item.fieldName]"
                  autocomplete="off"
                  :invisible-button="
                    item.hasOwnProperty('invisibleButton')
                      ? item.invisibleButton
                      : true
                  "
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请输入'
                      : '无'
                  "
                  :disabled="item.disabled"
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
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  :allow-search="
                    item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                  "
                  :disabled="item.disabled"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请选择'
                      : '无'
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
                  :filter-tree-node="
                    (searchValue, node) =>
                      filterSelectTreeNode(searchValue, node, item.namefield)
                  "
                  :allow-search="
                    item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                  "
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  :disabled="item.disabled"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请选择'
                      : '无'
                  "
                  @change="(value) => onchangeSelect(value, item.fieldName)"
                />
                <a-cascader
                  v-else-if="item.type === 'cascader'"
                  v-model="form[item.fieldName]"
                  :options="item.options || []"
                  expand-trigger="hover"
                  :disabled="item.disabled"
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
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请选择'
                      : '无'
                  "
                  :allow-search="
                    item.hasOwnProperty('allowSearch') ? item.allowSearch : true
                  "
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  @change="(value) => onchangeCascade(value, item.fieldName)"
                />
                <a-radio-group
                  v-else-if="item.type === 'radioGroup'"
                  v-model="form[item.fieldName]"
                  :style="item.hasOwnProperty('style') ? item.style : ''"
                  :disabled="item.disabled"
                  :options="item.hasOwnProperty('options') ? item.options : []"
                  @change="(value) => onchangeRadioGroup(value, item.fieldName)"
                />
                <dictionary-select
                  v-else-if="item.type === 'dictionary'"
                  v-model="form[item.fieldName]"
                  :disabled="item.disabled"
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
                      : editable
                      ? '请选择'
                      : '无'
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
                <a-date-picker
                  v-else-if="item.type === 'datetime'"
                  v-model="form[item.fieldName]"
                  style="width: 100%"
                  :disabled="item.disabled"
                  :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="
                    item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                  "
                  :show-time="item.showtime"
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  @change="
                    (_value, date, dateString) =>
                      onchangeDate(date, dateString, item.fieldName)
                  "
                />
                <a-range-picker
                  v-else-if="item.type === 'datetimeRange'"
                  v-model="form[item.fieldName]"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请选择'
                      : '无'
                  "
                  :format="item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'"
                  :value-format="
                    item.format ? item.format : 'YYYY-MM-DD HH:mm:ss'
                  "
                  :show-time="item.showtime"
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  :disabled="item.disabled"
                />
                <a-time-picker
                  v-else-if="item.type === 'time'"
                  v-model="form[item.fieldName]"
                  :format="item.format ? item.format : 'HH:mm:ss'"
                  :step="item.hasOwnProperty('step') ? item.step : {}"
                  :placeholder="
                    item.hasOwnProperty('placeholder')
                      ? item.placeholder
                      : editable
                      ? '请选择'
                      : '无'
                  "
                  :allow-clear="
                    item.hasOwnProperty('allowClear') ? item.allowClear : false
                  "
                  :disabled="item.disabled"
                />
                <FileUpload v-else-if="item.type === 'file'" ref="fileRef" />
                <!-- <a-upload
                v-else-if="item.type === 'file'"
                :file-list="form[item.fieldName]"
                :multiple="item.multiple"
                :accept="item.accept"
                :disabled="item.disabled"
                :draggable="
                  item.hasOwnProperty('draggable') ? item.draggable : false
                "
                :auto-upload="false"
                :custom-request="customRequest"
                @change="(file) => onchangeFile(file, item.fieldName)"
              >
                <a-button>
                  {{
                    item.hasOwnProperty('buttonText')
                      ? item.buttonText
                      : '选择文件'
                  }}
                </a-button>
              </a-upload> -->
                <slot
                  v-else-if="item.type === 'other'"
                  :name="item.fieldName"
                  :form="form"
                />
              </a-form-item>
            </a-col>

            <!--配置了show-file-upload选项时会显示附件上传项-->
            <a-col
              v-if="showFileUpload"
              :span="
              fileUpload.hasOwnProperty('span') ?
              fileUpload.span :
              ((dataSource[0] as any)?.col ?
              (dataSource[0] as any).col : 12)
            "
            >
              <a-form-item
                field="file"
                :rules="
                  fileUpload.hasOwnProperty('required')
                    ? [{ validator: fileUploadValidator }]
                    : undefined
                "
              >
                <template #label>
                  <icon-link />
                  文件
                </template>
                <!-- 文件上传 -->
                <FileUpload
                  ref="fileUploadRef"
                  :draggable="
                    fileUpload.hasOwnProperty('draggable')
                      ? fileUpload.draggable
                      : false
                  "
                  :accept="fileUpload.accept || undefined"
                  :disabled="
                    fileUpload.hasOwnProperty('disabled')
                      ? fileUpload.disabled
                      : false
                  "
                  :limit="
                    fileUpload.hasOwnProperty('limit') ? fileUpload.limit : 0
                  "
                  :business-key="
                    fileUpload.hasOwnProperty('keyField')
                      ? dataRecord[fileUpload.keyField]
                      : ''
                  "
                  :business-type="fileUpload.businessType || ''"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-drawer>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import {
    ref,
    toRefs,
    watch,
    nextTick,
    onMounted,
    defineExpose,
    PropType,
  } from 'vue';
  import dayjs from 'dayjs';
  import DictionarySelect from '../dictionary-select/index.vue';
  import SecretLevelSelect from '../secret-level-select/index.vue';
  import FileUpload from '../file-upload/index.vue';

  const props = defineProps({
    type: {
      // 控制按钮类型
      type: String as PropType<
        'primary' | 'text' | 'dashed' | 'outline' | 'secondary' | undefined
      >,
      default: 'primary',
    },
    click: {
      // 控制使用Button还是a标签进行点击触发
      type: String,
      default: 'button',
    },
    block: {
      // 控制按钮宽度是否和父容器的宽度一样
      type: Boolean,
      default: false,
    },
    clickword: {
      // 点击具体内容
      type: String,
      default: '新增',
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
    // 控制抽屉宽度
    narrow: { default: false, type: Boolean },
    // 控制抽屉宽度
    wide: { default: false, type: Boolean },
    // 表单子项信息列表
    dataSource: {
      type: Array,
      default() {
        return [];
      },
    },
    // 记录表单初值，一旦传值将赋值给data，返回时也为data
    dataRecord: {
      type: Object,
      default() {
        return {};
      },
    },
    // 表单中是否展示密级表项
    showSecretLevel: { type: Boolean, default: false },
    // 表单中是否含有附件上传项
    showFileUpload: { type: Boolean, default: false },
    // 附件上传选项
    fileUpload: {
      type: Object,
      default: () => {
        // empty
      },
    },
    // 表单是否可编辑
    editable: { type: Boolean, default: true },
    rules: {
      type: Object,
      default: () => {
        // empty
      },
    },
  });
  const emits = defineEmits([
    'change',
    'select',
    'close',
    'open',
    'file',
    'date',
    'cascade',
    'radioGroup',
    'number',
    'dictionary',
    'secret',
  ]);
  /**
   * data
   */
  const {
    showSecretLevel,
    showFileUpload,
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
    editable,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const visible = ref(false);
  const form = ref<any>({});
  const drawerForm = ref<any>();
  const fileUploadRef = ref<any>();
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
  const setFormValues = (values: any) => {
    // 应传入Json数据(例如:{xx:'a',yy:'b'})，遍历表单项，进行填充<!--created by ljx--><!--2022/03/29-->
    if (values !== undefined && values !== null) {
      // 排除undefined和null
      nextTick(() => {
        dataSource.value.forEach((element: any) => {
          const { fieldName } = element;
          if (values[fieldName] !== undefined && values[fieldName] !== null) {
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
      case 'radioGroup':
        val = val || null;
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
      case 'password':
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
        val = item.initialValue;
        break;
      case 'select-tree':
        val = val || '';
        break;
      case 'cascader':
        val = item.initialValue || [];
        break;
      case 'radioGroup':
        val = item.initialValue || null;
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
      case 'password':
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
    // 展示密级字段时，单独赋初值
    if (showSecretLevel.value) {
      form.value.secretLevel = String(dataRecord.value.secretLevel || '');
    }

    if (dataRecord.value && Object.keys(dataRecord.value).length > 0) {
      dataSource.value.forEach((elem: any) => {
        elem.type = elem.type || 'text';
        elem.disabled = elem.disabled || !editable.value;
        setinitial(elem); // 用于修改抽屉
      });
    } else {
      dataSource.value.forEach((elem: any) => {
        elem.type = elem.type || 'text';
        elem.disabled = elem.disabled || !editable.value;
        setdefault(elem); // 用于新增抽屉
      });
    }
  };
  const drawerRefresh = () => {
    if (showSecretLevel.value) {
      form.value.secretLevel = String(dataRecord.value.secretLevel || '');
    }

    if (dataRecord.value && Object.keys(dataRecord.value).length > 0) {
      dataSource.value.forEach((elem: any) => {
        elem.disabled = elem.disabled || !editable.value;
        setinitial(elem);
      });
    } else {
      dataSource.value.forEach((elem: any) => {
        elem.disabled = elem.disabled || !editable.value;
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
        } else if (!item.mode || item.mode === 'default') {
          val = form.value[item.fieldName];
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
        val = form.value[item.fieldName];
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
   * @description 关闭抽屉
   */
  const onClose = () => {
    visible.value = false;
    drawerForm.value.resetFields(); // 关闭抽屉的时候重置一下表单
    emits('close');
  };

  const fileUploadValidator = (
    _value: undefined,
    callback: (error?: string) => void
  ) => {
    if (!fileUploadRef.value.validate()) {
      callback('请上传至少一个附件');
    }
  };

  const submitting = ref<boolean>(false);

  /**
   * @method
   * @description 点击确认 将表单数据发送给父组件
   */
  const onSubmit = () => {
    drawerForm.value
      .validate(() => {
        // empty
      })
      // eslint-disable-next-line consistent-return
      .then((error: any) => {
        if (!error) {
          const reqdata: any = {};

          // 如果有密级字段则多返回一个密级值
          if (showSecretLevel.value) {
            reqdata.secretLevel = form.value.secretLevel;
          }
          dataSource.value.forEach((elem: any) => {
            if (
              form.value[elem.fieldName] !== undefined &&
              form.value[elem.fieldName] !== null
            ) {
              reqdata[elem.fieldName] = setreq(elem);
            }
          });
          emits('change', reqdata, (action: 'upload', val: string) => {
            // empty
            if (action === 'upload' && val) {
              fileUploadRef.value.handleSubmit(val);
            }
            onClose();
          });
          if (showFileUpload.value) {
            if (
              props.fileUpload.businessKey ||
              dataRecord.value[props.fileUpload.keyField || 'id']
            ) {
              // businessKey存在或dataRecord[keyField]存在，为编辑模式，可自动取得并上传
              fileUploadRef.value.handleSubmit();
              onClose();
            } else if (props.fileUpload.noBusinessKey) {
              // 明确表示不需要bk，也可以自动上传
              fileUploadRef.value.handleSubmit();
              onClose();
            } else {
              // 有文件上传的时候抽屉关闭需要推迟到获取id后
              submitting.value = true;
            }
          } else {
            onClose();
          }
        } else {
          return false;
        }
      });
  };

  // /**
  //  * @method
  //  * @description uploade组件自定义的上传请求参数
  //  */
  // const customRequest = (option: any) => {
  //   const { onProgress, onError, onSuccess, fileItem } = option;
  //   const xhr = new XMLHttpRequest();
  //   if (xhr.upload) {
  //     xhr.upload.onprogress = (event) => {
  //       let percent;
  //       if (event.total > 0) {
  //         // 0 ~ 1
  //         percent = event.loaded / event.total;
  //       }
  //       onProgress(percent, event);
  //     };
  //   }
  //   xhr.onerror = function error(e) {
  //     onError(e);
  //   };
  //   xhr.onload = function onload() {
  //     if (xhr.status < 200 || xhr.status >= 300) {
  //       return onError(xhr.responseText);
  //     }
  //     return onSuccess(xhr.response);
  //   };

  //   const formData = new FormData();
  //   formData.append('file', fileItem.file);
  //   xhr.open('post', url.value, true);
  //   xhr.send(formData);

  //   return {
  //     abort() {
  //       xhr.abort();
  //     },
  //   };
  // };

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
  // const onchangeFile = (file: any, name: string) => {
  //   form.value[name] = file;
  //   emits('file', file, name);
  // };
  // 密级字段发生变化时触发
  const onchangeSecret = (value: any) => {
    emits('secret', value);
  };
  /**
   * 服务于树选择组件的搜索功能
   * @param searchValue
   * @param nodeData
   */
  const filterSelectTreeNode = (
    searchValue: string,
    nodeData: any,
    namefield: string
  ) => {
    return (
      nodeData[namefield].toLowerCase().indexOf(searchValue.toLowerCase()) > -1
    );
  };

  watch(
    () => visible.value,
    (val) => {
      if (val) {
        setTimeout(() => {
          drawerInit();
        }, 0);
      }
    },
    { deep: true, immediate: true }
  );
  /**
   * onMounted
   */
  onMounted(() => {
    drawerInit();
  });
  /**
   * watch
   */
  // watch(
  //   () => dataRecord,
  //   (val) => {
  //     drawerInit();
  //   },
  //   { deep: true, immediate: true }
  // );
  // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
  defineExpose({
    showDrawer,
    drawerInit,
    drawerRefresh,
    setFormValues,
  });
</script>
