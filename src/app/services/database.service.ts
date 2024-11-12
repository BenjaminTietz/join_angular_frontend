import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Contact } from "../models/contact.class";
import { Task } from "../models/task.class";
import { SubTask } from "../models/subTask.class";

@Injectable({
  providedIn: "root",
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
      console.log("Tasks received:", tasks);

      this.todoTasks = tasks.filter((task) => task.status === "todo");
      this.inProgressTasks = tasks.filter(
        (task) => task.status === "inProgress"
      );
      this.awaitFeedbackTasks = tasks.filter(
        (task) => task.status === "awaitFeedback"
      );
      this.urgentTasks = tasks.filter(
        (task) => task.priority === "urgent"
      ).length;
      this.doneTasks = tasks.filter((task) => task.status === "done");
      this.nextDueDate = this.getNextDueDateForUrgentTasks(tasks);
      console.log("Next due date for urgent tasks:", this.nextDueDate);
      this.tasksCount = tasks.length;
    });
  }

  get headers() {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return token
      ? new HttpHeaders().set("Authorization", `Token ${token}`)
      : new HttpHeaders();
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
    console.log("Creating contact:", formattedContact);
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
    const urgentTasks = tasks.filter((task) => task.priority === "urgent");
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
}
