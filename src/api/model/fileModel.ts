// 文件配置记录
export interface FileRecord {
  id: string;
  path?: string;
  url?: string;
  createTime?: string;
  size?: string;
  type?: string;
  secretLevel?: number;
  businessType?: string;
  businessKey?: string;
}

export interface FileRecordSearchReq {
  businessType?: string;
  businessKey?: string;
  secretLevel?: number;
}

export interface FileRecordReq {
  businessType?: string;
  businessKey?: string;
  secretLevel?: number | string;
  path?: string;
}

// 分页查询的参数
export interface FileParams extends Partial<FileRecord> {
  pageNo: number;
  pageSize: number;
  // Partial携带具体查询条件
}

// 列表值
export interface FileListRes {
  list: FileRecord[];
  total: number;
}
