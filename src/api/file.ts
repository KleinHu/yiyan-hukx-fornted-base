/**
 * @file 通用文件服务，包含上传、下载、列表；以及excel导出
 */

import request from '@/utils/request/request';
import requestFile from '@/utils/request/requestFileHeaders';
import { FileListRes, FileParams, FileRecordReq } from './model/fileModel';

// 分页查询文件列表
export function queryFileRecordPage(params: FileParams) {
  return request.get<FileListRes>('/api/infra/file/file/page', {
    params,
  });
}

// 上传文件
export function uploadFile(data: FormData, params: FileRecordReq) {
  return request.post('/api/infra/file/file/business-upload', data, {
    params,
    headers: {
      'Content-Type': 'application/form-data',
    },
  });
}

// 下载文件
export function downloadFile(id: string) {
  return requestFile.get(`/api/infra/file/file/download/${id}`, {
    responseType: 'blob',
  });
}

// 删除文件
export function deleteFile(id: string) {
  return request.delete('/api/infra/file/file/delete', {
    params: { id },
  });
}

// 导出excel
export function exportFile(url: string) {
  return requestFile.get(url, { responseType: 'blob' });
}
