import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import departmentApi from '@/api/hr/department';
import type { Department, DepartmentTreeNode } from '@/api/hr/types';

/**
 * 部门管理 Hook（OA 用：部门树选择，如台账编辑时选择部门）
 * @param options 配置选项
 * @returns 部门相关数据和方法
 */
function useDepartmentTree(options?: {
  autoLoad?: boolean; // 是否自动加载
  includeRoot?: boolean; // 是否包含根节点（顶级部门）
  rootLabel?: string; // 根节点标签，默认"顶级部门"
}) {
  const {
    autoLoad = true,
    includeRoot = false,
    rootLabel = '顶级部门',
  } = options || {};

  const departmentTreeData = ref<DepartmentTreeNode[]>([]);
  const loading = ref(false);

  /**
   * 获取部门树数据
   */
  const fetchDepartmentTree = async () => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentTree();
      if (data) {
        if (includeRoot) {
          departmentTreeData.value = [
            {
              deptId: '0',
              deptName: rootLabel,
              deptLevel: 0,
              sortOrder: 0,
              isActive: true,
              parentId: '-1',
              children: Array.isArray(data) ? data : [],
            } as DepartmentTreeNode,
          ];
        } else {
          departmentTreeData.value = Array.isArray(data) ? data : [];
        }
      }
    } catch (error) {
      Message.error('获取部门树失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据部门ID查找部门节点
   * @param deptId 部门ID
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 部门节点
   */
  const findDepartmentById = (
    deptId: string,
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode | undefined => {
    const searchTree = tree || departmentTreeData.value;
    const found = searchTree.find((node) => node.deptId === deptId);
    if (found) return found;
    return searchTree.reduce<DepartmentTreeNode | undefined>((result, node) => {
      if (result) return result;
      if (node.children && node.children.length > 0) {
        return findDepartmentById(deptId, node.children);
      }
      return undefined;
    }, undefined);
  };

  /**
   * 扁平化部门树（用于下拉选项等）
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 扁平化的部门列表
   */
  const flattenDepartmentTree = (
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode[] => {
    const result: DepartmentTreeNode[] = [];
    const traverse = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(tree || departmentTreeData.value);
    return result;
  };

  /**
   * 获取部门详情
   * @param deptId 部门ID
   * @returns 部门详情
   */
  const fetchDepartmentDetail = async (
    deptId: string
  ): Promise<Department | null> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentById(deptId);
      return data || null;
    } catch (error) {
      Message.error('获取部门详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => {
    return fetchDepartmentTree();
  };

  if (autoLoad) {
    onMounted(() => {
      fetchDepartmentTree();
    });
  }

  return {
    departmentTreeData,
    loading,
    fetchDepartmentTree,
    findDepartmentById,
    flattenDepartmentTree,
    fetchDepartmentDetail,
    refresh,
  };
}

export default useDepartmentTree;
