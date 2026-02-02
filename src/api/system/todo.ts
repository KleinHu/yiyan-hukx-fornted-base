import request from '@/utils/request/request';
import { TodoListRes, TodoParams } from '@/api/system/model/todoModel';

// 分页查询待办列表
export function queryTodoRecordListByPage(userId: string, params: TodoParams) {
  return request.get<TodoListRes>(
    `/api/system/todo/task/doing/page/${userId}`,
    {
      params,
    }
  );
}

// 分页查询已办列表
export function queryTodoDoneRecordListByPage(
  userId: string,
  params: TodoParams
) {
  return request.get<TodoListRes>(`/api/system/todo/task/done/page/${userId}`, {
    params,
  });
}

// 阅读代办
export function readeTodoRecord(taskId: string, id: string) {
  return request.put(`/api/system/todo/task/${taskId}/user/${id}`);
}

// 删除代办
export function deleteTodoRecord(id: string) {
  return request.delete(`/api/system/todo/task/${id}`);
}
