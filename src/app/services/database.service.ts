import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Contact } from '../models/contact.class';
import { Task } from '../models/task.class';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private tasksUrl = `${environment.baseRefUrl}/task/`;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private contactsUrl = `${environment.baseRefUrl}/contact/`;
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  private contactDetailSubject = new BehaviorSubject<Contact | null>(null);
  public contactDetail$ = this.contactDetailSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTasks();
    this.loadContacts();
  }

  get headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Token ' + localStorage.getItem('token')
    );
  }

  private loadTasks() {
    this.http
      .get<Task[]>(this.tasksUrl, { headers: this.headers })
      .subscribe((tasks) => {
        this.tasksSubject.next(tasks);
      });
  }

  public getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  public createTask(task: Task): Observable<Task> {
    const formattedTask = {
      title: task.title,
      description: task.description,
      category: task.category.toLowerCase(),
      priority: task.priority.toLowerCase(),
      status: 'todo',
      due_date: task.dueDate,
      assigned_to: task.assignedTo,
    };

    return this.http.post<Task>(this.tasksUrl, formattedTask, {
      headers: this.headers,
    });
  }

  private loadContacts() {
    this.http
      .get<Contact[]>(this.contactsUrl, { headers: this.headers })
      .subscribe((contacts) => {
        this.contactsSubject.next(contacts);
      });
  }

  public getContacts(): Observable<Contact[]> {
    return this.contacts$;
  }

  public getContactById(id: string): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.get<Contact>(url, { headers: this.headers }).pipe(
      map((contact) => {
        this.contactDetailSubject.next(contact);
        return contact;
      })
    );
  }
  public createContact(contact: Contact): Observable<Contact> {
    const formattedContact = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    };

    return this.http.post<Contact>(this.contactsUrl, formattedContact, {
      headers: this.headers,
    });
  }

  public updateContact(
    id: string,
    updatedContact: Partial<Contact>
  ): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.put<Contact>(url, updatedContact, {
      headers: this.headers,
    });
  }
}
