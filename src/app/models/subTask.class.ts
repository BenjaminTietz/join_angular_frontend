import { Task } from './task.class';

export class SubTask {
  taskId: Task['id'];
  subTaskId: string;
  title: string;
  checked: boolean;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.taskId = obj ? obj.id : '';
    this.subTaskId = obj ? obj.subTaskId : '';
    this.title = obj ? obj.title : '';
    this.checked = obj ? obj.checked : false;
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
