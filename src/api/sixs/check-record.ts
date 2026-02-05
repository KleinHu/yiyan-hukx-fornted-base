import request from '@/utils/request/request';
import type {
  SixSCheckRecord,
  SixSCheckRecordQuery,
  SixSPageResult,
} from '@/api/sixs/model/sixsModel';

/**
 * 6S 检查记录 API（易研平台 /api/240/oa/sixs/check-record，含积分字段）
 */
const sixsCheckRecordApi = {
  /**
   * 根据 ID 获取检查记录
   * @param id 主键
   * @returns 检查记录详情
   */
  getById(id: string | number) {
    return request.get<SixSCheckRecord>(`/api/240/oa/sixs/check-record/${id}`);
  },

  /**
   * 获取列表（不分页）
   * @param query 查询参数（含 accountId 可查积分明细）
   * @returns 检查记录列表
   */
  getList(query?: SixSCheckRecordQuery) {
    return request.get<SixSCheckRecord[]>(
      '/api/240/oa/sixs/check-record/list',
      {
        params: query,
      }
    );
  },

  /**
   * 分页查询
   * @param query 查询参数（含 accountId 可查积分明细）
   * @returns 分页结果
   */
  getPage(query: SixSCheckRecordQuery) {
    return request.get<SixSPageResult<SixSCheckRecord>>(
      '/api/240/oa/sixs/check-record/page',
      { params: query }
    );
  },

  /**
   * 新增检查记录（后端自动扣分、更新台账总积分）
   * @param data 检查记录数据
   * @returns 主键 ID
   */
  save(data: SixSCheckRecord) {
    return request.post<number>('/api/240/oa/sixs/check-record', data);
  },

  /**
   * 修改检查记录
   * @param data 检查记录数据
   * @returns 是否成功
   */
  update(data: SixSCheckRecord) {
    return request.put<boolean>('/api/240/oa/sixs/check-record', data);
  },

  /**
   * 删除检查记录
   * @param id 主键
   * @returns 是否成功
   */
  deleteById(id: string | number) {
    return request.delete<boolean>(`/api/240/oa/sixs/check-record/${id}`);
  },

  /**
   * 批量删除
   * @param ids 主键列表
   * @returns 是否成功
   */
  deleteBatch(ids: (string | number)[]) {
    return request.delete<boolean>('/api/240/oa/sixs/check-record', {
      data: ids,
    });
  },
};

export default sixsCheckRecordApi;
