<template>
  <a-modal
    :visible="visible"
    width="1100px"
    :body-style="{ padding: '0px', backgroundColor: '#f2f3f5' }"
    :footer="false"
    fullscreen
    unmount-on-close
    @cancel="emit('update:visible', false)"
  >
    <template #title>
      <div class="modal-header">
        <icon-user-group />
        <span class="title">选择人员</span>
      </div>
    </template>

    <div class="selector-wrapper">
      <div class="selector-content">
        <!-- 左侧：组织架构 -->
        <div class="panel-card left-panel">
          <div class="panel-header">组织机构</div>
          <div class="panel-body">
            <a-input-search
              v-model="searchDeptTreeKey"
              placeholder="搜索部门"
              allow-clear
              class="search-input"
              @input="onDeptTreeSearch"
            />
            <div class="tree-container">
              <div class="custom-scrollbar tree-scroll-container">
                <a-skeleton v-if="departmentLoading" animation>
                  <a-skeleton-line :rows="12" />
                </a-skeleton>
                <div v-else>
                  <a-empty v-if="departmentTreeWithAll.length === 0" />
                  <a-tree
                    v-else
                    v-model:selected-keys="selectedDeptKeys"
                    v-model:expanded-keys="expandedDeptKeys"
                    block-node
                    class="custom-tree"
                    :field-names="{
                      key: 'deptId',
                      title: 'deptName',
                      children: 'children',
                    }"
                    :data="departmentTreeWithAll"
                    @select="onSelectDeptNode"
                  >
                    <template #icon="{ node }">
                      <icon-apps v-if="node.key === ALL_DEPARTMENTS_KEY" />
                      <icon-folder
                        v-else-if="node.children && node.children.length"
                      />
                      <icon-home v-else />
                    </template>
                  </a-tree>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：人员选择 -->
        <div class="panel-card middle-panel">
          <div class="middle-search-wrapper">
            <a-input-search
              v-model="searchEmployeeKey"
              placeholder="搜索姓名或邮箱/工号..."
              allow-clear
              size="large"
              class="main-search"
              @search="onEmployeeSearch"
              @input="onEmployeeSearchInput"
            />
          </div>
          <div class="list-context-bar">
            <div class="path-info">
              <span class="current-node">{{ currentDeptName }}</span>
              <span class="count-tag"
                >· 共 {{ employeePagination.total }} 位成员</span
              >
            </div>
            <div class="actions">
              <a-checkbox
                v-if="multiple"
                v-model:checked="allCheckedInCurrentPage"
                :disabled="employeeList.length === 0"
                @change="onSelectAllCurrentPage"
              >
                全选
              </a-checkbox>
            </div>
          </div>
          <div class="panel-body list-body">
            <a-spin
              :loading="employeeLoading"
              style="width: 100%; height: 100%"
            >
              <div class="grid-scroll custom-scrollbar">
                <a-row :gutter="[12, 12]" class="card-grid">
                  <template v-if="employeeList.length > 0">
                    <a-col
                      v-for="emp in employeeList"
                      :key="emp.userCode"
                      :xs="12"
                      :sm="12"
                      :md="12"
                      :lg="8"
                      :xl="6"
                    >
                      <EmployeeCard
                        :employee="emp"
                        :checked="selectedEmployeeKeys.includes(emp.userCode)"
                        @select="onEmployeeCardSelect"
                      />
                    </a-col>
                  </template>
                  <div v-else class="empty-placeholder">
                    <a-empty description="该目录下暂无成员" />
                  </div>
                </a-row>
              </div>
            </a-spin>
          </div>
          <div class="panel-footer">
            <a-pagination
              size="small"
              :total="employeePagination.total"
              :current="employeePagination.current"
              :page-size="employeePagination.pageSize"
              show-total
              show-page-size
              @change="onEmployeePageChange"
              @page-size-change="onEmployeePageSizeChange"
            />
          </div>
        </div>

        <!-- 右侧：已选预览 -->
        <div class="panel-card right-panel">
          <div class="panel-header">
            <div class="header-left">
              <icon-check-square />
              <span class="title"
                >已选成员 ({{ chosenEmployees.length
                }}{{ max ? `/${max}` : '' }})</span
              >
            </div>
            <a-link status="danger" class="clear-btn" @click="confirmClear"
              >清空</a-link
            >
          </div>
          <div class="panel-body">
            <div class="chosen-list-container custom-scrollbar">
              <div
                v-for="emp in chosenEmployees"
                :key="emp.userCode"
                class="chosen-item"
              >
                <a-avatar
                  :size="32"
                  :style="{ backgroundColor: getAvatarColor(emp.gender) }"
                >
                  <span v-if="!emp.avatarUrl">{{
                    emp.userName?.charAt(emp.userName.length - 1)
                  }}</span>
                  <img v-else :src="emp.avatarUrl" />
                </a-avatar>
                <div class="item-info">
                  <div class="name">{{ emp.userName }}</div>
                  <div class="sub">
                    {{ emp.jobTitle || '职员' }} · {{ emp.departmentName }}
                  </div>
                </div>
                <icon-delete
                  class="delete-icon"
                  @click="removeChosenEmployee(emp)"
                />
              </div>
              <a-empty
                v-if="chosenEmployees.length === 0"
                description="暂未选择人员"
              />
            </div>
          </div>
          <div class="confirm-action">
            <a-button
              type="primary"
              size="large"
              long
              class="submit-btn"
              @click="handleOk"
            >
              确认选择
              <template #icon><icon-arrow-right /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { debounce } from 'lodash';
  import {
    IconUserGroup,
    IconApps,
    IconFolder,
    IconHome,
    IconCheckSquare,
    IconDelete,
    IconArrowRight,
  } from '@arco-design/web-vue/es/icon';
  import useDepartmentTree from '@/hooks/hr/department';
  import useEmployeeList from '@/hooks/hr/employee';
  import type { DepartmentTreeNode, Employee } from '@/api/hr/types';
  import EmployeeCard from './EmployeeCard.vue';

  const props = withDefaults(
    defineProps<{
      visible: boolean;
      defaultSelectedEmployees?: Employee[];
      multiple?: boolean;
      max?: number;
    }>(),
    {
      multiple: true,
      defaultSelectedEmployees: () => [],
    }
  );

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void;
    (e: 'submit', employees: Employee[]): void;
  }>();

  // --- 左侧部门树 ---
  const searchDeptTreeKey = ref('');
  const selectedDeptKeys = ref<string[]>([]);
  const expandedDeptKeys = ref<string[]>([]);

  const {
    departmentTreeData,
    loading: departmentLoading,
    fetchDepartmentTree,
  } = useDepartmentTree({ autoLoad: true });

  const ALL_DEPARTMENTS_KEY = '__all_departments__';

  const currentDeptName = computed(() => {
    if (selectedDeptKeys.value[0] === ALL_DEPARTMENTS_KEY)
      return '所有部门人员';
    const findNode = (
      nodes: DepartmentTreeNode[],
      key: string
    ): DepartmentTreeNode | undefined => {
      let found: DepartmentTreeNode | undefined;
      nodes.some((node) => {
        if (node.deptId === key) {
          found = node;
          return true;
        }
        if (node.children) {
          found = findNode(node.children, key);
          return !!found;
        }
        return false;
      });
      return found;
    };
    const active = findNode(
      departmentTreeData.value,
      selectedDeptKeys.value[0]
    );
    return active ? active.deptName : '组织架构';
  });

  const filteredDepartmentTree = computed(() => {
    if (!searchDeptTreeKey.value) return departmentTreeData.value;
    const filterNodes = (nodes: DepartmentTreeNode[], keyword: string) => {
      const res: DepartmentTreeNode[] = [];
      nodes.forEach((node) => {
        if (node.deptName.includes(keyword)) {
          res.push({ ...node });
        } else if (node.children) {
          const children = filterNodes(node.children, keyword);
          if (children.length) res.push({ ...node, children });
        }
      });
      return res;
    };
    return filterNodes(departmentTreeData.value, searchDeptTreeKey.value);
  });

  const departmentTreeWithAll = computed(() => {
    const allNode: DepartmentTreeNode = {
      deptId: ALL_DEPARTMENTS_KEY,
      deptName: '所有部门人员',
      deptLevel: 0,
      sortOrder: 0,
      isActive: true,
      children: [],
    };
    return [allNode, ...filteredDepartmentTree.value];
  });

  const onDeptTreeSearch = debounce(() => {
    if (!searchDeptTreeKey.value) expandedDeptKeys.value = [];
  }, 300);

  const onSelectDeptNode = (keys: any[]) => {
    selectedDeptKeys.value = keys;
    const deptId = keys[0];
    const departmentId =
      deptId && deptId !== ALL_DEPARTMENTS_KEY ? deptId : undefined;
    employeePagination.value.current = 1;
    fetchEmployeeList({ departmentId }, true);
  };

  // --- 中间列表 ---
  const searchEmployeeKey = ref('');
  const chosenEmployees = ref<Employee[]>([]);

  const {
    employeeList,
    loading: employeeLoading,
    pagination: employeePagination,
    fetchEmployeeList,
  } = useEmployeeList({
    autoLoad: false,
    pageSize: 40,
    filterStatus: 2,
  });

  // 显式设置分页大小为 40
  employeePagination.value.pageSize = 40;

  const selectedEmployeeKeys = computed(() =>
    chosenEmployees.value.map((e) => e.userCode)
  );

  const allCheckedInCurrentPage = computed({
    get() {
      return (
        employeeList.value.length > 0 &&
        employeeList.value.every((e) =>
          selectedEmployeeKeys.value.includes(e.userCode)
        )
      );
    },
    set(val) {
      onSelectAllCurrentPage(val);
    },
  });

  const onEmployeeSearchInput = debounce(() => onEmployeeSearch(), 300);

  const onEmployeeSearch = (resetPage = true) => {
    if (resetPage) {
      employeePagination.value.current = 1;
    }
    fetchEmployeeList(
      {
        userName: searchEmployeeKey.value || undefined,
        userCode: searchEmployeeKey.value || undefined,
        departmentId:
          selectedDeptKeys.value[0] !== ALL_DEPARTMENTS_KEY
            ? selectedDeptKeys.value[0]
            : undefined,
      },
      true
    );
  };

  const onEmployeePageChange = (current: number) => {
    employeePagination.value.current = current;
    onEmployeeSearch(false);
  };

  const onEmployeePageSizeChange = (pageSize: number) => {
    employeePagination.value.pageSize = pageSize;
    onEmployeeSearch(true);
  };

  const onEmployeeCardSelect = (employee: Employee) => {
    if (!props.multiple) {
      chosenEmployees.value = [employee];
      return;
    }
    const idx = chosenEmployees.value.findIndex(
      (e) => e.userCode === employee.userCode
    );
    if (idx > -1) {
      chosenEmployees.value.splice(idx, 1);
    } else {
      if (props.max && chosenEmployees.value.length >= props.max) {
        Message.warning(`最多只能选择 ${props.max} 人`);
        return;
      }
      chosenEmployees.value.push(employee);
    }
  };

  const onSelectAllCurrentPage = (checked: any) => {
    if (checked) {
      employeeList.value.forEach((emp) => {
        if (!selectedEmployeeKeys.value.includes(emp.userCode)) {
          if (props.max && chosenEmployees.value.length >= props.max) return;
          chosenEmployees.value.push(emp);
        }
      });
    } else {
      const keys = employeeList.value.map((e) => e.userCode);
      chosenEmployees.value = chosenEmployees.value.filter(
        (e) => !keys.includes(e.userCode)
      );
    }
  };

  const removeChosenEmployee = (emp: Employee) => {
    chosenEmployees.value = chosenEmployees.value.filter(
      (e) => e.userCode !== emp.userCode
    );
  };

  const confirmClear = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要移除所有已选成员吗？',
      onOk: () => {
        chosenEmployees.value = [];
      },
    });
  };

  const handleOk = () => {
    if (chosenEmployees.value.length === 0) {
      Message.warning('请至少选择一名人员');
      return;
    }
    emit('submit', chosenEmployees.value);
    emit('update:visible', false);
  };

  const getAvatarColor = (gender?: number) => {
    if (gender === 2) return '#f53f3f';
    if (gender === 1) return '#165dff';
    return '#86909c';
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        selectedDeptKeys.value = [ALL_DEPARTMENTS_KEY];
        chosenEmployees.value = props.defaultSelectedEmployees
          ? [...props.defaultSelectedEmployees]
          : [];
        fetchDepartmentTree();
        onEmployeeSearch();
      }
    }
  );

  onMounted(() => {
    if (props.visible) {
      selectedDeptKeys.value = [ALL_DEPARTMENTS_KEY];
      onEmployeeSearch();
    }
  });
</script>

<style scoped lang="less">
  /* 美化滚动条 */
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #e5e6eb;
      border-radius: 3px;
      &:hover {
        background-color: #c9cdd4;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }

  .selector-wrapper {
    height: calc(100vh - 48px);
    padding: 16px;
    box-sizing: border-box;

    .selector-content {
      display: flex;
      gap: 16px;
      height: 100%;
    }

    .panel-card {
      background: #ffffff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e6eb;
      overflow: hidden;
      height: 100%; /* 关键：固定卡片高度为父级 100%，防止随内容撑开 */
      min-height: 0; /* 允许 flex 项收缩 */

      .panel-header {
        height: 48px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f2f3f5;
        font-weight: 600;
        color: #1d2129;
        flex-shrink: 0;
      }

      .panel-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 12px;

        .chosen-list-container {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
      }
    }

    .left-panel {
      width: 260px;
      .tree-container {
        flex: 1;
        overflow: hidden;
        margin-top: 8px;

        .tree-scroll-container {
          height: 100%;
          overflow-y: auto;
        }
      }
      .search-input {
        margin-bottom: 8px;
      }
    }

    .middle-panel {
      flex: 1;
      background: transparent;
      border: none;
      gap: 12px;

      .middle-search-wrapper {
        background: #fff;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #e5e6eb;

        .main-search {
          :deep(.arco-input-wrapper) {
            background-color: #f7f8fa;
            border: none;
            &:hover,
            &.arco-input-focus {
              background-color: #fff;
              box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
            }
          }
        }
      }

      .list-context-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px;

        .path-info {
          .current-node {
            font-size: 14px;
            font-weight: 500;
            color: #1d2129;
          }
          .count-tag {
            font-size: 13px;
            color: #86909c;
            margin-left: 4px;
          }
        }
      }

      .list-body {
        /* flex: 1;  删除 flex: 1 防止与 a-spin 冲突 */
        /* min-height: 0; */
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e5e6eb;
        padding: 0; /* 这里的 padding 移到 grid-scroll 内部 */
        display: flex;
        flex-direction: column;
        flex: 1; /* 重新加上Flex属性确保占位 */
        min-height: 0;

        .grid-scroll {
          height: 100%; /* 强制高度，不依赖 flex */
          overflow-y: auto;
          box-sizing: border-box;
          padding: 12px;
          padding-bottom: 48px; /* 大幅增加底部留白 */
        }

        .card-grid {
          margin: 0;
          width: 100%;
        }

        .empty-placeholder {
          width: 100%;
          padding: 64px 0;
        }
      }

      .panel-footer {
        height: 44px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e5e6eb;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 16px;
      }
    }

    .right-panel {
      width: 300px;

      .panel-header {
        justify-content: space-between;
        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1d2129;
        }
        .clear-btn {
          font-weight: normal;
          font-size: 13px;
        }
      }

      .chosen-item {
        display: flex;
        align-items: center;
        padding: 10px 8px;
        border-radius: 6px;
        transition: background 0.2s;

        &:hover {
          background: #f7f8fa;
          .delete-icon {
            opacity: 1;
          }
        }

        .item-info {
          flex: 1;
          margin: 0 12px;
          min-width: 0;

          .name {
            font-size: 14px;
            font-weight: 500;
            color: #1d2129;
          }
          .sub {
            font-size: 12px;
            color: #86909c;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .delete-icon {
          color: #86909c;
          cursor: pointer;
          opacity: 0.4;
          transition: all 0.2s;
          &:hover {
            color: #f53f3f;
          }
        }
      }

      .confirm-action {
        padding: 16px;
        border-top: 1px solid #f2f3f5;

        .submit-btn {
          border-radius: 6px;
          font-weight: 500;
          height: 44px;
        }
      }
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .custom-tree {
    :deep(.arco-tree-node-title) {
      font-size: 14px;
    }
    :deep(.arco-tree-node-selected) {
      .arco-tree-node-title {
        color: #165dff;
        font-weight: 500;
      }
    }
  }
</style>
