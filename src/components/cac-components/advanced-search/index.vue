<template>
  <div class="cac-search-form">
    <a-form
      layout="vertical"
      :style="{ marginBottom: '8px' }"
      :model="form"
      @submit="handleSubmit"
      @keyup.enter="handleSubmit"
    >
      <a-row :gutter="24">
        <a-col
          v-for="(item, index) in (dataSource as any[])"
          v-show="
            index < partition - 1 || (index >= partition - 1 && !collapsed)
          "
          :key="item.fieldName"
          :span="24 / partition"
        >
          <a-form-item :label="item.labelText">
            <a-input
              v-if="item.type === 'text'"
              v-model="form[item.fieldName]"
              allow-clear
              :placeholder="
                item.hasOwnProperty('placeholder') ? item.placeholder : '请输入'
              "
            />
            <a-input-number
              v-if="item.type === 'number'"
              v-model="form[item.fieldName]"
              allow-clear
              style="width: 100%"
              :min="item.hasOwnProperty('min') ? item.min : 0"
              :max="item.hasOwnProperty('max') ? item.max : 2147483647"
              :placeholder="
                item.hasOwnProperty('placeholder') ? item.placeholder : '请输入'
              "
            />
            <a-select
              v-else-if="item.type === 'select'"
              v-model="form[item.fieldName]"
              :allow-search="
                item.hasOwnProperty('allowSearch') ? item.allowSearch : false
              "
              :placeholder="
                item.hasOwnProperty('placeholder') ? item.placeholder : '请选择'
              "
            >
              <a-option
                v-for="(optionitem, optionindex) in item.options"
                :key="optionindex"
                :value="optionitem.value"
              >
                {{ optionitem.label }}
              </a-option>
              <a-option key="asdfghjkl" value=""> 全部查询 </a-option>
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
              allow-clear
              :disabled="item.disabled"
              :placeholder="
                item.hasOwnProperty('placeholder') ? item.placeholder : '请选择'
              "
            />
            <a-cascader
              v-else-if="item.type === 'cascader'"
              v-model="form[item.fieldName]"
              :field-names="
                item.hasOwnProperty('fieldNames')
                  ? item.fieldNames
                  : {
                      label: 'label',
                      value: 'value',
                      children: 'children',
                    }
              "
              allow-clear
              :options="item.options"
              :placeholder="
                item.hasOwnProperty('placeholder') ? item.placeholder : '请选择'
              "
            />
            <a-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="form[item.fieldName]"
              :show-time="showtimeformat(item)"
              :value-format="item.format ? item.format : 'YYYY-MM-DD HH:mm'"
              allow-clear
              style="width: 100%"
              :placeholder="
                item.hasOwnProperty('placeholder')
                  ? item.placeholder
                  : '请选择日期'
              "
            />
            <a-time-picker
              v-else-if="item.type === 'time'"
              v-model="form[item.fieldName]"
              :show-time="showtimeformat(item)"
              :format="item.format ? item.format : 'HH:mm'"
              allow-clear
              style="width: 100%"
              :placeholder="
                item.hasOwnProperty('placeholder')
                  ? item.placeholder
                  : '请选择时间'
              "
            />
            <a-range-picker
              v-else-if="item.type === 'datetimeRange'"
              v-model="form[item.fieldName]"
              :show-time="showtimeformat(item)"
              :value-format="item.format ? item.format : 'YYYY-MM-DD'"
              allow-clear
              style="width: 100%"
              :placeholder="
                item.hasOwnProperty('placeholder')
                  ? item.placeholder
                  : ['开始日期', '结束日期']
              "
            />
            <!-- 字典选择-dictionary -->
            <dictionary-select
              v-else-if="item.type === 'dictionary'"
              v-model="form[item.fieldName]"
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
                item.hasOwnProperty('placeholder') ? item.placeholder : '请选择'
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
            <slot
              v-else-if="item.type === 'other'"
              :form="form"
              :name="item.fieldName"
            />
          </a-form-item>
        </a-col>
        <!-- <a-col :span="inlineRowSpan" :style="{ display: 'block', height: '100%', textAlign: 'right' }" :class="collapsed ? 'inline-btn-row' : null"> -->
        <a-col class="inline-btn-row" :span="inlineRowSpan">
          <a-button type="primary" size="medium" @click="handleSubmit">
            查询
          </a-button>
          <a-button
            style="margin-left: 5px"
            size="medium"
            @click="resetSearchForm"
          >
            清空
          </a-button>
          <a-button
            v-if="showCollapsedText"
            size="medium"
            type="text"
            style="margin-left: 5px"
            @click="togglecollapsed"
          >
            <template #icon>
              <icon-down v-if="collapsed" />
              <icon-up v-else />
            </template>
            {{ collapsed ? '更多' : '收起' }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    toRefs,
    computed,
    watch,
    nextTick,
    onMounted,
  } from 'vue';
  import DictionarySelect from '@/components/cac-components/dictionary-select/index.vue';

  export default defineComponent({
    components: { DictionarySelect },
    props: {
      dataSource: { type: Array, default: (): any[] => [] },
      expand: { type: Boolean, default: false },
      partition: { type: Number, default: 4 },
    },
    emits: ['change', 'reset'],

    setup(props, ctx) {
      const form = ref<any>({});
      const collapsed = ref<boolean>(!props.expand);
      const { dataSource, partition } = toRefs(props);

      const togglecollapsed = () => {
        collapsed.value = !collapsed.value;
      };

      //   watch: {
      //   dataSource: {
      //     deep: true,
      //     immediate: true,

      //     handler() {
      //       this.initalForm();
      //     },
      //   },
      // },

      // computed
      const showCollapsedText = computed(() => {
        return dataSource.value.length > partition.value - 1;
      });
      const inlineRowSpan = computed(() => {
        const span = 24 / partition.value;
        return collapsed.value
          ? span
          : span *
              (partition.value - (dataSource.value.length % partition.value));
      });

      const filterOption = (input: string, option: any) => {
        return (
          option.componentOptions.children[0].text
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        );
      };

      const showtimeformat = (item: any): any => {
        if (Object.prototype.hasOwnProperty.call(item, 'format')) {
          const showtime = item.format.split(' ')[1];
          if (showtime !== undefined) {
            return { format: showtime };
          }
        } else if (
          item.type === 'datetime' &&
          !Object.prototype.hasOwnProperty.call(item, 'format')
        ) {
          return true;
        }
        return false;
      };

      const initalForm = () => {
        dataSource.value.forEach((element: any) => {
          if (element.type === 'datetimeRange' || element.type === 'cascader') {
            form.value[element.fieldName] = element.initialValue || [];
          } else if (element.type === 'number') {
            form.value[element.fieldName] = element.initialValue ?? 0;
          } else {
            form.value[element.fieldName] =
              Object.prototype.hasOwnProperty.call(element, 'initialValue')
                ? element.initialValue
                : '';
          }
        });
      };

      const handleSubmit = () => {
        const reqdata: any = {};
        dataSource.value.forEach((element: any) => {
          if (form.value[element.fieldName] !== '') {
            if (element.type === 'datetimeRange') {
              if (form.value[element.fieldName]?.length > 0) {
                if (element.rangeformat === 'date') {
                  reqdata[element.fieldName] =
                    form.value[element.fieldName].join(',');
                  // const [beginF, endF] = form.value[element.fieldName];
                  // reqdata[`${element.fieldName}Begin`] = beginF;
                  // reqdata[`${element.fieldName}End`] = endF;
                } else {
                  reqdata[element.fieldName] = `${
                    form.value[element.fieldName][0]
                  } 00:00:00,${form.value[element.fieldName][1]} 23:59:59`;
                  // reqdata[`${element.fieldName}Begin`] = `${
                  //   form.value[element.fieldName][0]
                  // } 00:00`;
                  // reqdata[`${element.fieldName}End`] = `${
                  //   form.value[element.fieldName][1]
                  // } 23:59`;
                }
              }
            } else if (element.type === 'cascader') {
              if (form.value[element.fieldName].length !== 0) {
                reqdata[element.fieldName] = form.value[element.fieldName];
              }
            } else if (element.type === 'dictionary') {
              if (
                element.dictionarytype
                  ? element.dictionarytype === 'array'
                  : false
              ) {
                reqdata[element.fieldName] = [];
                reqdata[element.fieldName].push(form.value[element.fieldName]);
              } else if (
                element.dictionarytype
                  ? element.dictionarytype === 'code'
                  : false
              ) {
                reqdata[element.fieldName] = form.value[element.fieldName].code;
              } else {
                reqdata[element.fieldName] = form.value[element.fieldName];
              }
            } else {
              reqdata[element.fieldName] = form.value[element.fieldName];
            }
          }
        });
        ctx.emit('change', reqdata);
      };

      const resetSearchForm = () => {
        // 重置整个查询表单
        initalForm();
        handleSubmit();
        ctx.emit('reset');
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
          nodeData[namefield].toLowerCase().indexOf(searchValue.toLowerCase()) >
          -1
        );
      };

      /**
       * @method
       * @param {object} values
       * @description 给表单设置指定值
       */
      const setFormValues = (values: any) => {
        // 应传入Json数据(例如:{xx:'a',yy:'b'})，遍历表单项，进行填充<!--created by ljx--><!--2022/03/29-->
        // console.log('-----values', values);
        if (values !== undefined && values !== null) {
          // 排除undefined和null
          nextTick(() => {
            dataSource.value.forEach((element: any) => {
              const { fieldName } = element;
              // console.log('item--', item)
              // console.log('-----values', values)
              if (
                values[fieldName] !== undefined &&
                values[fieldName] !== null
              ) {
                form.value[fieldName] = values[fieldName];
              }
            });
          });
        }
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
      };

      onMounted(() => {
        initalForm();
      });

      // watch
      watch(dataSource, (newId) => {
        if (newId.length < partition.value) {
          togglecollapsed();
        }
        // initalForm(); // 把它注释掉了，不知道这里为啥要重置表单，好像没必要
      });

      return {
        form,
        collapsed,
        //   dataSource,

        inlineRowSpan,
        togglecollapsed,
        showCollapsedText,

        filterOption,
        showtimeformat,
        initalForm,
        handleSubmit,
        filterSelectTreeNode,
        setFormValues,
        resetSearchForm,
        onchangeDictSelect,
      };
    },
  });
</script>

<style scoped>
  .inline-btn-row {
    display: block;
    margin-top: 30px;
    text-align: right;
  }

  .cac-search-form {
    margin-bottom: 10px;
    padding: 10px;
    border-bottom: 1px solid #e0e8ef;
  }

  .cac-search-form:deep() .ant-form-item {
    margin-bottom: 5px !important;
  }

  .cac-search-form:deep() .ant-calendar-picker {
    width: 100%;
  }

  .cac-search-form:deep() .ant-form-item-label {
    line-height: 1.1em !important;
  }

  .cac-search-form:deep() label {
    color: #567 !important;
    font-size: 0.95em !important;
  }
</style>
