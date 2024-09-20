import { User } from './user.class';
export class Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  color: string;
  createdAt: string;
  createdBy: User['userId'];

  constructor(obj?: any) {
    this.id = obj ? obj.id : '';
    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.phone = obj ? obj.phone : '';
    this.initials = obj ? obj.initials : '';
    this.color = obj ? obj.color : '';
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
