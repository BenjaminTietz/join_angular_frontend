import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Contact } from '../models/contact.class';
import { Task } from '../models/task.class';
import { SubTask } from '../models/subTask.class';

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

  private taskIdSubject = new BehaviorSubject<string | null>(null);
  public taskDataSubject = new BehaviorSubject<Task | null>(null);

  public todoTasks: Task[] = [];
  public inProgressTasks: Task[] = [];
  public awaitFeedbackTasks: Task[] = [];
  public doneTasks: Task[] = [];
  public tasksCount = 0;
  public urgentTasks = 0;
  public nextDueDate: string | null = null;

  public showEditTaskOverlay = false;
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
      assignedTo: task.assignedTo,
      subTasks: task.subTasks,
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
  public deleteTask(id: string): Observable<any> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.delete(url, { headers: this.headers }).pipe(
      map((response) => {
        this.loadTasks();
        return response;
      })
    );
  }

  public addSubtasks(taskId: string, subtasks: SubTask[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_subtasks/`;
    return this.http.post<any>(url, { subtasks }, { headers: this.headers });
  }
  public updateSubtaskStatus(
    taskId: string,
    id: string,
    checked: boolean
  ): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${id}/update/`;
    const body = { checked: checked };

    return this.http.patch<any>(url, body, {
      headers: this.headers,
    });
  }
  public deleteSubtask(taskId: string, subtaskId: string): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${subtaskId}/`;
    return this.http.delete<any>(url, { headers: this.headers });
  }
  public addAssignees(taskId: string, assignedTo: Contact[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_assignees/`;
    return this.http.post<any>(url, { assignedTo }, { headers: this.headers });
  }

  public loadContacts() {
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
  public deleteContact(id: string): Observable<any> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.delete(url, { headers: this.headers });
  }

  // Helper function to get the next due date for urgent tasks
  public getNextDueDateForUrgentTasks(tasks: Task[]): string | null {
    const urgentTasks = tasks.filter((task) => task.priority === 'urgent');
    urgentTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    return urgentTasks.length > 0 ? urgentTasks[0].dueDate : null;
  }

  // Getter and Setter for taskId
  setTaskId(taskId: string | null) {
    this.taskIdSubject.next(taskId);
  }

  getTaskId(): Observable<string | null> {
    return this.taskIdSubject.asObservable();
  }

  // Getter and Setter for taskData
  setTaskData(task: Task | null) {
    this.taskDataSubject.next(task);
  }

  getTaskData(): Observable<Task | null> {
    return this.taskDataSubject.asObservable();
  }

  // init functions to create demo
  public taskInit() {
    const demoTasks: Task[] = [
      new Task({
        title: 'Task 1',
        description: 'Description for Task 1',
        category: 'purchase',
        priority: 'medium',
        status: 'todo',
        dueDate: this.randomDate(),
        assignedTo: [],
        subTasks: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Task({
        title: 'Task 2',
        description: 'Description for Task 2',
        category: 'sales',
        priority: 'urgent',
        status: 'inProgress',
        dueDate: this.randomDate(),
        assignedTo: [],
        subTasks: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Task({
        title: 'Task 3',
        description: 'Description for Task 3',
        category: 'development',
        priority: 'low',
        status: 'awaitFeedback',
        dueDate: this.randomDate(),
        assignedTo: [],
        subTasks: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Task({
        title: 'Task 4',
        description: 'Description for Task 4',
        category: 'accounting',
        priority: 'urgent',
        status: 'done',
        dueDate: this.randomDate(),
        assignedTo: [],
        subTasks: [],
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
    ];

    demoTasks.forEach((task) => {
      this.createTask(task)
        .pipe(
          tap((response) => {
            console.log('Demo Task created:', response);
          })
        )
        .subscribe({
          error: (error) => {
            console.error('Error creating demo task:', error);
          },
        });
    });
  }

  public contactInit() {
    const demoContacts: Contact[] = [
      new Contact({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        initials: 'JD',
        color: '#FF5733',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Contact({
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '987-654-3210',
        initials: 'JS',
        color: '#33FF57',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Contact({
        id: '3',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '555-555-5555',
        initials: 'AJ',
        color: '#3377FF',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
      new Contact({
        id: '4',
        name: 'Bob Brown',
        email: 'bob.brown@example.com',
        phone: '444-444-4444',
        initials: 'BB',
        color: '#FF33AA',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }),
    ];

    demoContacts.forEach((contact) => {
      this.createContact(contact)
        .pipe(
          tap((response) => {
            console.log('Demo Contact created:', response);
          })
        )
        .subscribe({
          error: (error) => {
            console.error('Error creating demo contact:', error);
          },
        });
    });
  }

  // helper function to create random date
  private randomDate(): string {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + Math.floor(Math.random() * 30));
    return end.toISOString().split('T')[0];
  }
}
