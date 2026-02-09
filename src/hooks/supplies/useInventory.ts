import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as suppliesApi from '@/api/supplies';
import type { InventoryChangeRequest } from '@/api/supplies';
import { useUserStore } from '@/store';

/**
 * 办公用品库存管理 Hook
 */
export default function useInventory() {
  const loading = ref(false);

  /**
   * 变更库存 (出入库、盘点等)
   */
  const changeStock = async (req: InventoryChangeRequest) => {
    try {
      loading.value = true;
      const userStore = useUserStore();
      const finalReq = {
        ...req,
        operatorName:
          req.operatorName || userStore.nickname || userStore.username,
        operatorCode: req.operatorCode || userStore.userCode,
      };
      await suppliesApi.changeInventory(finalReq);
      Message.success('库存操作成功');
      return true;
    } catch (error) {
      Message.error('库存操作失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    changeStock,
  };
}
