import request from '@/utils/request/request';
import type {
  SixSCategory,
  SixSCategoryQuery,
  SixSPageResult,
} from '@/api/sixs/model/sixsModel';

/**
 * 6S 标准化分类 API（易研平台 /api/240/oa/sixs/category）
 */
const sixsCategoryApi = {
  /**
   * 根据 ID 获取分类
   * @param id 主键
   * @returns 分类详情
   */
  getById(id: number) {
    return request.get<SixSCategory>(`/api/240/oa/sixs/category/${id}`);
  },

  /**
   * 获取列表（不分页）
   * @param query 查询参数
   * @returns 分类列表
   */
  getList(query?: SixSCategoryQuery) {
    return request.get<SixSCategory[]>('/api/240/oa/sixs/category/list', {
      params: query,
    });
  },

  /**
   * 分页查询
   * @param query 查询参数
   * @returns 分页结果
   */
  getPage(query: SixSCategoryQuery) {
    return request.get<SixSPageResult<SixSCategory>>(
      '/api/240/oa/sixs/category/page',
      {
        params: query,
      }
    );
  },

  /**
   * 新增分类
   * @param data 分类数据
   * @returns 主键 ID
   */
  save(data: SixSCategory) {
    return request.post<number>('/api/240/oa/sixs/category', data);
  },

  /**
   * 修改分类
   * @param data 分类数据
   * @returns 是否成功
   */
  update(data: SixSCategory) {
    return request.put<boolean>('/api/240/oa/sixs/category', data);
  },

  /**
   * 删除分类
   * @param id 主键
   * @returns 是否成功
   */
  deleteById(id: number) {
    return request.delete<boolean>(`/api/240/oa/sixs/category/${id}`);
  },

  /**
   * 批量删除
   * @param ids 主键列表
   * @returns 是否成功
   */
  deleteBatch(ids: number[]) {
    return request.delete<boolean>('/api/240/oa/sixs/category', { data: ids });
  },
};

export default sixsCategoryApi;
