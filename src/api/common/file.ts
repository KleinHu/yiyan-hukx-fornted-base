import request from '@/utils/request/request';

/**
 * OA业务专属文件上传接口
 * @param data FormData，需包含 file 字段
 * @param path 可选路径参数
 */
export default function uploadOaFile(data: FormData, path?: string) {
  return request.post<any>('/api/240/oa/file/upload', data, {
    params: { path },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
