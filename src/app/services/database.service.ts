import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Contact } from "../models/contact.class";
import { Task } from "../models/task.class";
import { SubTask } from "../models/subTask.class";
import { CommunicationService } from "./communication.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private tasksUrl = `${environment.baseRefUrl}/task/`;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private contactsUrl = `${environment.baseRefUrl}/contacts/`;
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
  private isDataInitialized = false;
  public showEditTaskOverlay = false;
  constructor(
    private http: HttpClient,
    private communicationService: CommunicationService
  ) {}

  public initializeData(forceReload = false) {
    if (
      !this.communicationService.isLoggedIn ||
      (this.isDataInitialized && !forceReload)
    )
      return;
    this.loadTasks();
    this.loadContacts();
    this.tasks$.subscribe((tasks) => {
      this.todoTasks = tasks.filter((task) => task.status === "todo");
      this.inProgressTasks = tasks.filter(
        (task) => task.status === "inProgress"
      );
      this.awaitFeedbackTasks = tasks.filter(
        (task) => task.status === "awaitFeedback"
      );
      this.doneTasks = tasks.filter((task) => task.status === "done");
      this.tasksCount = tasks.length;
      this.urgentTasks = tasks.filter(
        (task) => task.priority === "urgent"
      ).length;
      this.nextDueDate = this.getNextDueDateForUrgentTasks(tasks);
    });

    this.isDataInitialized = true;
  }

  public loadTasks() {
    this.http.get<Task[]>(this.tasksUrl).subscribe({
      next: (tasks) => {
        this.tasksSubject.next(tasks);
      },
      error: (err) => {
        console.error("Error loading tasks:", err);
        this.tasksSubject.next([]);
      },
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
      due_date: task.dueDate,
      assignedTo: task.assignedTo,
      subTasks: task.subTasks,
    };

    return this.http.post<Task>(this.tasksUrl, formattedTask);
  }

  public updateTask(id: string, updatedTask: Partial<Task>): Observable<Task> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.put<Task>(url, updatedTask);
  }
  public deleteTask(id: string): Observable<any> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.delete(url).pipe(
      map((response) => {
        this.loadTasks();
        return response;
      })
    );
  }

  public addSubtasks(taskId: string, subtasks: SubTask[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_subtasks/`;
    return this.http.post<any>(url, { subtasks });
  }
  public updateSubtaskStatus(
    taskId: string,
    id: string,
    checked: boolean
  ): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${id}/update/`;
    const body = { checked: checked };

    return this.http.patch<any>(url, body);
  }
  public deleteSubtask(taskId: string, subtaskId: string): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${subtaskId}/`;
    return this.http.delete<any>(url);
  }
  public addAssignees(taskId: string, assignedTo: Contact[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_assignees/`;
    return this.http.post<any>(url, { assignedTo });
  }

  public loadContacts() {
    this.http.get<Contact[]>(this.contactsUrl).subscribe({
      next: (contacts) => {
        this.contactsSubject.next(contacts);
      },
      error: (err) => {
        console.error("Error loading contacts:", err);
        this.contactsSubject.next([]);
      },
    });
  }

  public getContacts(): Observable<Contact[]> {
    return this.contacts$;
  }

  public getContactById(id: string): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.get<Contact>(url).pipe(
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
    return this.http.post<Contact>(this.contactsUrl, formattedContact);
  }

  public updateContact(
    id: string,
    updatedContact: Partial<Contact>
  ): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.put<Contact>(url, updatedContact);
  }
  public deleteContact(id: string): Observable<any> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.delete(url);
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
