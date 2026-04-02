import queryString from 'query-string';
import request from '@/utils/request/request';

/**
 * 分页数据响应
 */
export interface PageData<T> {
  list: T[];
  total: number;
}

// ==========================================
// 文章专栏相关接口
// ==========================================

export interface ArticleColumnVO {
  id?: string;
  parentId?: string; // 父级专栏ID
  name: string;
  description?: string;
  coverUrl?: string;
  sortOrder?: number;
  status?: number; // 1-启用 0-停用
  createTime?: string;
  children?: ArticleColumnVO[];
}

export interface ArticleColumnQuery {
  name?: string;
  status?: number;
  pageNo?: number;
  pageSize?: number;
}

/**
 * 分页查询专栏列表
 */
export function getColumnPage(params: ArticleColumnQuery) {
  return request.get<PageData<ArticleColumnVO>>(
    '/api/240/oa/article-column/page',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

/**
 * 查询所有已启用的专栏
 */
export function getColumnListAll() {
  return request.get<ArticleColumnVO[]>('/api/240/oa/article-column/list-all');
}

/**
 * 查询专栏树
 */
export function getColumnListTree(params: ArticleColumnQuery) {
  return request.get<ArticleColumnVO[]>(
    '/api/240/oa/article-column/list-tree',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

/**
 * 新增专栏
 */
export function saveColumn(data: ArticleColumnVO) {
  return request.post<boolean>('/api/240/oa/article-column', data);
}

/**
 * 修改专栏
 */
export function updateColumn(data: ArticleColumnVO) {
  return request.put<boolean>('/api/240/oa/article-column', data);
}

/**
 * 删除专栏
 */
export function deleteColumn(id: string) {
  return request.delete<boolean>(`/api/240/oa/article-column/${id}`);
}

/**
 * 更新专栏状态(启用/禁用)
 */
export function updateColumnStatus(id: string, status: number) {
  return request.put<boolean>(`/api/240/oa/article-column/${id}/status`, null, {
    params: { status },
  });
}

// ==========================================
// 文章相关接口
// ==========================================

export interface ArticleVO {
  id?: string;
  columnId: string;
  title: string;
  summary?: string;
  coverUrl?: string;
  content?: string;
  authorName?: string;
  authorCode?: string;
  publishTime?: string;
  releaseTime?: string; // 定时发布时间
  offlineTime?: string; // 定时下线时间
  status?: number; // 0-草稿，1-待审核，2-已发布，3-已驳回，4-已下线，5-待下线审核，6-定时发布
  viewCount?: number;
  likeCount?: number; // 点赞数
  favoriteCount?: number; // 收藏数
  isTop?: number; // 1-置顶，0-普通
  auditOpinion?: string; // 审核意见
  topExpireTime?: string; // 置顶截止时间
  isReleaseTimed?: boolean; // 是否定时发布
  isOfflineTimed?: boolean; // 是否定时下线
  attachments?: string; // 附件(JSON)
  tags?: string; // 标签(逗号分隔)
  isMustRead?: number; // 1-必读，0-普通
  createTime?: string;
}

export interface ArticleReceiptVO {
  id?: string;
  articleId: string;
  userId: string;
  userName: string;
  deptId?: string;
  deptName?: string;
  createTime?: string;
}

export interface ArticleCommentVO {
  id?: string;
  articleId: string;
  content: string;
  userName: string;
  userCode: string;
  createTime?: string;
}

export interface ArticleViewRecordVO {
  id: string;
  articleId: string;
  userName: string;
  userCode: string;
  viewTime: string;
}

export interface ArticleQuery {
  title?: string;
  tag?: string;
  columnId?: string;
  status?: number;
  hotSort?: number; // 1-按热度，0-按时间
  beginTime?: string;
  endTime?: string;
  creator?: string; // 已废弃，请使用 authorCode
  authorCode?: string; // 按作者工号展示自己的文章
  pageNo?: number;
  pageSize?: number;
}

/**
 * 分页查询文章
 */
export function getArticlePage(params: ArticleQuery) {
  return request.get<PageData<ArticleVO>>('/api/240/oa/article/page', {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 分页查询待审批文章
 */
export function getArticleAuditPage(params: ArticleQuery) {
  return request.get<PageData<ArticleVO>>('/api/240/oa/article/audit/page', {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 获取文章详情
 */
export function getArticleDetail(id: string) {
  return request.get<ArticleVO>(`/api/240/oa/article/${id}`);
}

/**
 * 新增文章
 */
export function saveArticle(data: any) {
  return request.post<string>('/api/240/oa/article', data);
}

/**
 * 修改文章
 */
export function updateArticle(data: ArticleVO) {
  return request.put<boolean>('/api/240/oa/article', data);
}

/**
 * 物理删除文章
 */
export function deleteArticle(id: string) {
  return request.delete<boolean>(`/api/240/oa/article/${id}`);
}

/**
 * 提交送审
 */
export function submitArticleAudit(id: string) {
  return request.put<void>(`/api/240/oa/article/${id}/submit-audit`);
}

/**
 * 撤回审批
 */
export function withdrawArticle(id: string) {
  return request.put<void>(`/api/240/oa/article/${id}/withdraw`);
}

/**
 * 审批文章
 */
export function auditArticle(
  id: string,
  params: {
    pass: boolean;
    opinion?: string;
    isTop?: number;
    topExpireTime?: string;
    isReleaseTimed?: boolean;
    releaseTime?: string;
    isOfflineTimed?: boolean;
    offlineTime?: string;
    isMustRead?: number;
  }
) {
  return request.put<void>(`/api/240/oa/article/${id}/audit`, null, {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 申请下线文章（送审）
 */
export function applyOfflineArticle(id: string) {
  return request.put(`/api/240/oa/article/${id}/applyOffline`);
}

/**
 * 获取我的文章统计数据
 */
export function getMyArticleStats(authorCode: string) {
  return request.get<Record<string, number>>('/api/240/oa/article/my-stats', {
    params: { authorCode },
  });
}

/**
 * 下线文章（直接）
 */
export function offlineArticle(id: string) {
  return request.put<void>(`/api/240/oa/article/${id}/offline`);
}

/**
 * 重新发布文章
 */
export function publishArticle(id: string) {
  return request.put(`/api/240/oa/article/${id}/publish`);
}

/**
 * 设置/取消置顶
 */
export function toggleArticleTop(id: string) {
  return request.put<void>(`/api/240/oa/article/${id}/top`);
}

/**
 * 记录阅览行为
 */
export function recordArticleView(
  id: string,
  params: { userName: string; userCode: string }
) {
  return request.post<void>(`/api/240/oa/article/${id}/view`, null, {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 获取具体阅览详表
 */
export function getArticleViewRecords(id: string) {
  return request.get<ArticleViewRecordVO[]>(
    `/api/240/oa/article/${id}/view-records`
  );
}

/**
 * 获取总门户数据看板统计
 */
export function getArticleDashboardStats() {
  return request.get<Record<string, number>>(
    '/api/240/oa/article/dashboard-stats'
  );
}

/**
 * 点赞文章 (幂等)
 */
export function likeArticle(id: string, userCode: string) {
  return request.put(`/api/240/oa/article/${id}/like`, null, {
    params: { userCode },
  });
}

/**
 * 查询是否已点赞
 */
export function hasLikedArticle(id: string, userCode: string) {
  return request.get<boolean>(`/api/240/oa/article/${id}/has-liked`, {
    params: { userCode },
  });
}

// ==========================================
// 文章已阅回执接口
// ==========================================

/**
 * 提交已阅回执
 */
export function submitArticleReceipt(id: string, data: ArticleReceiptVO) {
  return request.post<void>(`/api/240/oa/article/receipt/${id}`, data);
}

/**
 * 查询是否已阅
 */
export function hasReadArticle(id: string, userId: string) {
  return request.get<boolean>(`/api/240/oa/article/receipt/status/${id}`, {
    params: { userId },
  });
}

/**
 * 查询已阅人员列表
 */
export function getReceiptPage(id: string, pageNo = 1, pageSize = 10) {
  return request.get<PageData<ArticleReceiptVO>>(
    `/api/240/oa/article/receipt/list/${id}`,
    {
      params: { pageNo, pageSize },
    }
  );
}

/**
 * 收藏文章 (幂等)
 */
export function favoriteArticle(id: string, userCode: string) {
  return request.post(`/api/240/oa/article/${id}/favorite`, null, {
    params: { userCode },
  });
}

/**
 * 查询是否已收藏
 */
export function hasFavoritedArticle(id: string, userCode: string) {
  return request.get<boolean>(`/api/240/oa/article/${id}/has-favorited`, {
    params: { userCode },
  });
}

/**
 * 分页查询我的收藏
 */
export function getFavoriteArticlePage(params: ArticleQuery) {
  return request.get<PageData<ArticleVO>>('/api/240/oa/article/favorite/page', {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 文章评论相关接口对象
 */
export const articleCommentApi = {
  /**
   * 获取文章评论列表
   */
  list(params: { articleId: string; pageNum?: number; pageSize?: number }) {
    return request.get<PageData<ArticleCommentVO>>(
      '/api/240/oa/article/comment/list',
      { params }
    );
  },

  /**
   * 发表评论
   */
  create(data: Partial<ArticleCommentVO>) {
    return request.post<Result<string>>('/api/240/oa/article/comment', data);
  },

  /**
   * 删除评论
   */
  delete(id: string) {
    return request.delete<Result<void>>(`/api/240/oa/article/comment/${id}`);
  },
};

/**
 * 后端通用返回结构 (如果其他地方没定义)
 */
export interface Result<T> {
  code: number;
  msg: string;
  data: T;
}
