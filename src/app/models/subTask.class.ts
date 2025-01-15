export class SubTask {
  task: string;
  id: string;
  title: string;
  checked: boolean;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.task = obj ? obj.task : "";
    this.id = obj ? obj.id : "";
    this.title = obj ? obj.title : "";
    this.checked = obj ? obj.checked : false;
    this.createdAt = obj ? obj.created_at : "";
    this.createdBy = obj ? obj.createdBy : "";
  }
}
