import request from '@/utils/request/request';
import { ToReadListRes, ToReadParams } from '@/api/system/model/toReadModel';

// 分页查询待阅列表
export function queryToReadRecordListByPage(
  userId: string,
  params: ToReadParams
) {
  return request.get<ToReadListRes>(
    `/api/system/todo/read/doing/page/${userId}`,
    {
      params,
    }
  );
}

// 分页查询已阅列表
export function queryToReadDoneRecordListByPage(
  userId: string,
  params: ToReadParams
) {
  return request.get<ToReadListRes>(
    `/api/system/todo/read/done/page/${userId}`,
    {
      params,
    }
  );
}

// 阅读待阅
export function readeToReadRecord(id: string) {
  return request.put(`/api/system/todo/read/${id}`);
}

// 删除待阅
export function deleteToReadRecord(id: string) {
  return request.delete(`/api/system/todo/read/${id}`);
}
