// 待办记录
export interface TodoRecord {
  id?: string; // 主键
  userId?: string; // 用户ID
  taskId?: string; // 任务ID
  readDone?: boolean; // 是否已阅
  title?: string; // 任务标题
  description?: string; // 任务描述
  systemId?: string; // 系统ID
  systemModule?: string; // 系统模块ID
  exId?: string; // 外部任务ID
  taskStatus?: number; // 任务状态
  taskUrl?: string; // 跳转url
  completedTime?: string; // 任务完成时间
  completedBy?: string; // 任务完成者
  createTime?: string; // 创建时间
}

// 分页查询的参数
export interface TodoParams extends Partial<TodoRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface TodoListRes {
  list: TodoRecord[];
  total: number;
}
