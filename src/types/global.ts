export interface AnyObject {
  [key: string]: unknown;
}

export interface Options {
  value: unknown;
  label: string;
}

export interface NodeOptions extends Options {
  children?: NodeOptions[];
}

export interface GetParams {
  body: null;
  type: string;
  url: string;
}

export interface PostData {
  body: string;
  type: string;
  url: string;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total?: number;
  showPageSize: boolean; // 是否显示分页数据条数选项
  showTotal: boolean; // 是否显示数据总数
}

export type TimeRanger = [string, string];

export interface GeneralChart {
  xAxis: string[];
  data: Array<{ name: string; value: number[] }>;
}
