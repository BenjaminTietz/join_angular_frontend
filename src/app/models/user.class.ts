export class User {
  userId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  createdAt: string;
  createdBy: string;

  constructor(obj?: any) {
    this.userId = obj ? obj.id : '';
    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.password = obj ? obj.password : '';
    this.confirmPassword = obj ? obj.confirmPassword : '';
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
