import { Contact } from './contact.class';
import { SubTask } from './subTask.class';

export class Task {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedTo: Contact['id'][];
  dueDate: string;
  priority: string;
  subTasks: SubTask[];
  status: string;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.id = obj ? obj.id : '';
    this.title = obj ? obj.title : '';
    this.description = obj ? obj.description : '';
    this.category = obj ? obj.category : '';
    this.assignedTo = obj ? obj.assignedTo : [];
    this.dueDate = obj ? obj.dueDate : '';
    this.priority = obj ? obj.priority : '';
    this.subTasks = obj ? obj.subTasks : [];
    this.status = obj ? obj.status : '';
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
