import { User } from './user.class';
export class Contact {
  contactId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  createdBy: User['userId'];

  constructor(obj?: any) {
    this.contactId = obj ? obj.id : '';
    this.name = obj ? obj.name : '';
    this.email = obj ? obj.email : '';
    this.phone = obj ? obj.phone : '';
    this.createdAt = obj ? obj.createdAt : '';
    this.createdBy = obj ? obj.createdBy : '';
  }
}
