import { Task } from './task.class';

export class SubTask {
  taskId: Task['id'];
  id: string;
  title: string;
  checked: boolean;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.taskId = obj ? obj.id : '';
    this.id = obj ? obj.id : '';
    this.title = obj ? obj.title : '';
    this.checked = obj ? obj.checked : false;
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
