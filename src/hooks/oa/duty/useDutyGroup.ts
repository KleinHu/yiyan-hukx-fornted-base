import { ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as dutyApi from '@/api/oa/duty';
import type { DutyGroupVO } from '@/api/oa/duty';

/**
 * 值班分组管理 Hook
 */
export default function useDutyGroup() {
  const loading = ref(false);
  const groupTree = ref<DutyGroupVO[]>([]);

  /**
   * 获取分组树
   */
  const fetchTree = async () => {
    try {
      loading.value = true;
      const { data } = await dutyApi.getDutyGroupTree();
      groupTree.value = data || [];
    } catch (error) {
      // 拦截器已处理错误提示
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存或更新分组
   */
  const saveOrUpdate = async (form: DutyGroupVO) => {
    try {
      loading.value = true;
      await dutyApi.saveDutyGroup(form);
      Message.success('保存成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除分组
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await dutyApi.deleteDutyGroup(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 扁平化分组映射，用于快速查找名称
   */
  const groupMap = computed(() => {
    const map = new Map<string, string>();
    const traverse = (nodes: DutyGroupVO[]) => {
      nodes.forEach((n) => {
        if (n.id) map.set(String(n.id), n.name);
        if (n.children) traverse(n.children);
      });
    };
    traverse(groupTree.value);
    return map;
  });

  /**
   * 根据 ID 获取分组名称
   */
  const getGroupName = (id?: string | number) => {
    if (!id) return '-';
    return groupMap.value.get(String(id)) || String(id);
  };

  return {
    loading,
    groupTree,
    groupMap,
    fetchTree,
    saveOrUpdate,
    remove,
    getGroupName,
  };
}
