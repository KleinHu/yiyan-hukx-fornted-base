import request from '@/utils/request/request';
import {
  QuickAccessListRes,
  QuickAccessParams,
  QuickAccessRecord,
} from '@/api/system/model/quickAccessModel';

// 分页查询快捷入口列表
export function queryQuickAccessRecordList(params: QuickAccessParams) {
  return request.get<QuickAccessListRes>('/api/system/custom-page-jump/page', {
    params,
  });
}

// 更新快捷入口
export function updateQuickAccessRecord(data: QuickAccessRecord[]) {
  return request.post(
    '/api/system/custom-page-jump/deleteAndGeneratePath',
    data
  );
}
