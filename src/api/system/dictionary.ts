import request from '@/utils/request/request';
import {
  DictTypeParams,
  DictTypeRecord,
  DictTypeListRes,
} from '@/api/system/model/dictTypeModel';
import { DictDataRecord } from '@/api/system/model/dictDataModel';

// 分页查询数据字典类型列表
export function queryDictTypeRecordList(params: DictTypeParams) {
  return request.get<DictTypeListRes>('/api/system/dict-type/page', { params });
}

// 新增数据字典类型
export function addDictTypeRecord(data: DictTypeRecord) {
  return request.post('/api/system/dict-type/save', data);
}

// 修改数据字典类型
export function editDictTypeRecord(data: DictTypeRecord) {
  return request.put('/api/system/dict-type/update', data);
}

// 删除数据字典类型，传id数组，支持批量
export function deleteDictTypeRecords(data: any) {
  return request.delete('/api/system/dict-type/delete', { data }); // 这里data要用{}，否则会报错
}

// 查询数据字典详情列表
export function queryDictDataRecordList(params: DictDataRecord) {
  return request.get<DictDataRecord[]>('/api/system/dict-data/list', {
    params,
  });
}

// 新增数据字典详情
export function addDictDataRecord(data: DictDataRecord) {
  return request.post('/api/system/dict-data/save', data);
}

// 修改数据字典详情
export function editDictDataRecord(data: DictDataRecord) {
  return request.put('/api/system/dict-data/update', data);
}

// 删除数据字典详情，传id数组，支持批量
export function deleteDictDataRecords(data: any) {
  return request.delete('/api/system/dict-data/delete', { data }); // 这里data要用{}，否则会报错
}
