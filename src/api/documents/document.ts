import queryString from 'query-string';
import request from '@/utils/request/request';

/**
 * 分页数据响应
 */
export interface PageData<T> {
  list: T[];
  total: number;
}

// ======================= 文档分类接口 =======================

export interface DocumentCategoryRecord {
  id?: string;
  parentId?: string;
  name: string;
  sort?: number;
  needApproval?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  children?: DocumentCategoryRecord[];
}

/**
 * 获取全部分类树
 */
export function getDocumentCategoryTree() {
  return request.get<DocumentCategoryRecord[]>(
    '/api/240/oa/document-category/tree'
  );
}

/**
 * 新增分类
 */
export function addDocumentCategory(data: Partial<DocumentCategoryRecord>) {
  return request.post<boolean>('/api/240/oa/document-category', data);
}

/**
 * 更新分类
 */
export function updateDocumentCategory(data: Partial<DocumentCategoryRecord>) {
  return request.put<boolean>('/api/240/oa/document-category', data);
}

/**
 * 删除分类
 */
export function deleteDocumentCategory(id: string) {
  return request.delete<boolean>(`/api/240/oa/document-category/${id}`);
}

// ======================= 文档信息接口 =======================

export interface DocumentRecord {
  id?: string;
  categoryId: string;
  name: string;
  type?: string;
  size?: number;
  url: string;
  currentVersion?: string;
  status?: number;
  statusName?: string;
  uploader?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocumentQuery {
  pageNo?: number;
  pageSize?: number;
  categoryId?: string;
  /** 多分类范围查询，点击父分类时传入子分类ID列表 */
  categoryIds?: string[];
  name?: string;
  status?: number;
  uploader?: string;
}

/**
 * 分页查询文档
 */
export function getDocumentPage(params: DocumentQuery) {
  return request.get<PageData<DocumentRecord>>('/api/240/oa/document/page', {
    params,
    paramsSerializer: (obj) => queryString.stringify(obj),
  });
}

/**
 * 保存文档
 */
export function addDocument(data: Partial<DocumentRecord>) {
  return request.post<boolean>('/api/240/oa/document', data);
}

/**
 * 更新文档
 */
export function updateDocument(data: Partial<DocumentRecord>) {
  return request.put<boolean>('/api/240/oa/document', data);
}

/**
 * 删除文档
 */
export function deleteDocument(id: string) {
  return request.delete<boolean>(`/api/240/oa/document/${id}`);
}

export interface ChangeVersionReq {
  documentId: string;
  newUrl: string;
  newFileName?: string;
  newFileSize?: number;
  updateLog?: string;
  uploader?: string;
}

/**
 * 更换文档版本
 */
export function changeDocumentVersion(data: ChangeVersionReq) {
  return request.post<void>('/api/240/oa/document/change-version', data);
}

// ======================= 历史版本接口 =======================

export interface DocumentVersionRecord {
  id?: string;
  documentId: string;
  versionNum: string;
  url: string;
  updateLog?: string;
  uploader?: string;
  createTime?: string;
}

/**
 * 分页查询文档历史版本
 */
export function getDocumentVersionPage(params: {
  documentId: string;
  pageNo: number;
  pageSize: number;
}) {
  return request.get<PageData<DocumentVersionRecord>>(
    '/api/240/oa/document-version/page',
    {
      params,
      paramsSerializer: (obj) => queryString.stringify(obj),
    }
  );
}
