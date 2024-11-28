import { Contact } from "./contact.class";
import { SubTask } from "./subTask.class";

export class Task {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedTo: Contact[];
  due_date: string;
  priority: string;
  subTasks: SubTask[];
  status: string;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.id = obj ? obj.id : "";
    this.title = obj ? obj.title : "";
    this.description = obj ? obj.description : "";
    this.category = obj ? obj.category : "";
    this.assignedTo = obj ? obj.assignedTo : [];
    this.due_date = obj ? obj.due_date : "";
    this.priority = obj ? obj.priority : "";
    this.subTasks = obj ? obj.subTasks : [];
    this.status = obj ? obj.status : "";
    this.createdAt = obj ? obj.createdAt : "";
    this.createdBy = obj ? obj.createdBy : "";
  }
}
