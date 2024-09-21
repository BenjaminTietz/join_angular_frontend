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

  public todoTasks: Task[] = [];
  public inProgressTasks: Task[] = [];
  public awaitFeedbackTasks: Task[] = [];
  public doneTasks: Task[] = [];
  public tasksCount = 0;
  public urgentTasks = 0;
  public nextDueDate: string | null = null;

  constructor(private http: HttpClient) {
    this.loadTasks();
    this.loadContacts();
    this.tasks$ = this.getTasks();
    this.tasks$.subscribe((tasks) => {
      console.log('Tasks received:', tasks);

      this.todoTasks = tasks.filter((task) => task.status === 'todo');
      this.inProgressTasks = tasks.filter(
        (task) => task.status === 'inProgress'
      );
      this.awaitFeedbackTasks = tasks.filter(
        (task) => task.status === 'awaitFeedback'
      );
      this.urgentTasks = tasks.filter(
        (task) => task.priority === 'urgent'
      ).length;
      this.doneTasks = tasks.filter((task) => task.status === 'done');
      this.nextDueDate = this.getNextDueDateForUrgentTasks(tasks);
      console.log('Next due date for urgent tasks:', this.nextDueDate);
      this.tasksCount = tasks.length;
    });
  }

  get headers() {
    return new HttpHeaders().set(
      'Authorization',
      'Token ' + localStorage.getItem('token')
    );
  }

  public loadTasks() {
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
      status: task.status,
      dueDate: task.dueDate,
      assigned_to: task.assignedTo,
    };

    return this.http.post<Task>(this.tasksUrl, formattedTask, {
      headers: this.headers,
    });
  }

  public updateTask(id: string, updatedTask: Partial<Task>): Observable<Task> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.put<Task>(url, updatedTask, {
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
      initials: contact.initials,
      color: contact.color,
    };
    console.log('Creating contact:', formattedContact);
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

  // Helper function to get the next due date for urgent tasks
  public getNextDueDateForUrgentTasks(tasks: Task[]): string | null {
    const urgentTasks = tasks.filter((task) => task.priority === 'urgent');
    urgentTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    return urgentTasks.length > 0 ? urgentTasks[0].dueDate : null;
  }
}
