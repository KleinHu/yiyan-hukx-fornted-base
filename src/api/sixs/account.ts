import request from '@/utils/request/request';
import type {
  SixSAccount,
  SixSAccountQuery,
  SixSAccountStatistics,
  SixSAccountTrend,
  SixSPageResult,
} from '@/api/sixs/model/sixsModel';
import queryString from 'query-string';

/**
 * 6S 积分台账 API（易研平台 /api/240/oa/sixs/account）
 */
const sixsAccountApi = {
  /**
   * 获取统计数据
   * @param year 年份
   * @returns 统计结果
   */
  getStatistics(year: number) {
    return request.get<SixSAccountStatistics>(
      '/api/240/oa/sixs/account/statistics',
      {
        params: { year },
      }
    );
  },

  /**
   * 根据 ID 获取台账
   * @param id 主键
   * @returns 台账详情
   */
  getById(id: string | number) {
    return request.get<SixSAccount>(`/api/240/oa/sixs/account/${id}`);
  },

  /**
   * 获取分数趋势
   * @param id 台账ID
   * @returns 趋势数据
   */
  getTrend(id: string | number) {
    return request.get<SixSAccountTrend[]>(
      `/api/240/oa/sixs/account/trend/${id}`
    );
  },

  /**
   * 获取列表（不分页）
   * @param query 查询参数
   * @returns 台账列表
   */
  getList(query?: SixSAccountQuery) {
    return request.get<SixSAccount[]>('/api/240/oa/sixs/account/list', {
      params: query,
      paramsSerializer: (p) => queryString.stringify(p),
    });
  },

  /**
   * 分页查询
   * @param query 查询参数
   * @returns 分页结果
   */
  getPage(query: SixSAccountQuery) {
    return request.get<SixSPageResult<SixSAccount>>(
      '/api/240/oa/sixs/account/page',
      {
        params: query,
        paramsSerializer: (p) => queryString.stringify(p),
      }
    );
  },

  /**
   * 新增台账
   * @param data 台账数据
   * @returns 主键 ID
   */
  save(data: SixSAccount) {
    return request.post<number>('/api/240/oa/sixs/account', data);
  },

  /**
   * 批量新增台账（需传参数 year 指定台账年份）
   * @param params year 台账年份，list 台账列表
   * @returns 是否成功
   */
  saveBatch(params: { year: number; list: SixSAccount[] }) {
    return request.post<boolean>('/api/240/oa/sixs/account/batch', params);
  },

  /**
   * 修改台账
   * @param data 台账数据
   * @returns 是否成功
   */
  update(data: SixSAccount) {
    return request.put<boolean>('/api/240/oa/sixs/account', data);
  },

  /**
   * 删除台账
   * @param id 主键
   * @returns 是否成功
   */
  deleteById(id: string | number) {
    return request.delete<boolean>(`/api/240/oa/sixs/account/${id}`);
  },

  /**
   * 批量删除
   * @param ids 主键列表
   * @returns 是否成功
   */
  deleteBatch(ids: (string | number)[]) {
    return request.delete<boolean>('/api/240/oa/sixs/account', { data: ids });
  },
};

export default sixsAccountApi;
