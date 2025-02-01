import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Contact } from "../models/contact.class";
import { Task } from "../models/task.class";
import { SubTask } from "../models/subTask.class";
import { CommunicationService } from "./communication.service";
import { catchError, tap } from "rxjs/operators";

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

  /**
   * Initializes the application's data by loading all tasks and contacts from the server.
   * If the data has already been initialized and forceReload is false, this method does nothing.
   * Otherwise, it loads the tasks and contacts and notifies the subscribers of the tasks$ observable.
   * It also sets the todoTasks, inProgressTasks, awaitFeedbackTasks, doneTasks, tasksCount, urgentTasks and nextDueDate properties.
   * @param forceReload Whether to force the reloading of the data, even if it has already been initialized.
   */
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

  /**
   * Loads all tasks from the server and notifies the subscribers of the tasks$ observable.
   * If the request fails, it logs the error and notifies the subscribers with an empty array.
   */
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

  /**
   * Returns an observable that emits the list of all tasks.
   * The emitted value is an array of Task objects.
   * @returns An observable that emits the list of all tasks.
   */
  public getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Creates a new task on the server.
   * The request body is a partial Task object with the following properties:
   * - title: The title of the task.
   * - description: The description of the task.
   * - category: The category of the task. Must be a valid category.
   * - priority: The priority of the task. Must be a valid priority.
   * - status: The status of the task. Must be a valid status.
   * - due_date: The due date of the task.
   * - assignedTo: The contacts assigned to the task.
   * - subTasks: The subtasks of the task.
   * @param task The new task to be created.
   * @returns An observable that emits the created task.
   */
  public createTask(task: Task): Observable<Task> {
    const formattedTask = {
      title: task.title,
      description: task.description,
      category: task.category.toLowerCase(),
      priority: task.priority.toLowerCase(),
      status: task.status,
      due_date: task.due_date,
      assignedTo: task.assignedTo,
      subTasks: task.subTasks,
    };

    return this.http.post<Task>(this.tasksUrl, formattedTask);
  }

  /**
   * Updates an existing task on the server.
   * The request body is a partial Task object with the properties to be updated.
   * The response is the updated task.
   * @param id The ID of the task to update.
   * @param updatedTask The partial Task object with the properties to be updated.
   * @returns An observable that emits the updated task.
   */
  public updateTask(id: string, updatedTask: Partial<Task>): Observable<Task> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.put<Task>(url, updatedTask);
  }

  /**
   * Deletes a task from the server.
   * The response is the deleted task.
   * When the task is deleted, the tasks list is reloaded.
   * @param id The ID of the task to delete.
   * @returns An observable that emits the deleted task.
   */
  public deleteTask(id: string): Observable<any> {
    const url = `${this.tasksUrl}${id}/`;
    return this.http.delete(url).pipe(
      map((response) => {
        this.loadTasks();
        return response;
      })
    );
  }

  /**
   * Adds one or more subtasks to an existing task on the server.
   * The request body is an object with a single property "subtasks" that is an array of SubTask objects.
   * The response is the updated task.
   * @param taskId The ID of the task to add subtasks to.
   * @param subtasks The array of SubTask objects to add.
   * @returns An observable that emits the updated task.
   */
  public addSubtasks(taskId: string, subtasks: SubTask[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_subtasks/`;
    return this.http.post<any>(url, { subtasks });
  }

  /**
   * Updates the checked status of a specific subtask on the server.
   * Sends a PATCH request to the server with the updated checked status.
   * @param taskId The ID of the task containing the subtask.
   * @param id The ID of the subtask to update.
   * @param checked The new checked status of the subtask.
   * @returns An observable that emits the server's response.
   */
  public updateSubtaskStatus(
    taskId: string,
    id: string,
    checked: boolean
  ): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${id}/update/`;
    const body = { checked: checked };

    return this.http.patch<any>(url, body);
  }

  /**
   * Updates a specific subtask on the server.
   * Sends a PATCH request to the server with the updated fields.
   * The response is the updated subtask.
   * @param taskId The ID of the task containing the subtask.
   * @param subtaskId The ID of the subtask to update.
   * @param updatedFields A partial SubTask object with the properties to be updated.
   * @returns An observable that emits the updated subtask.
   */
  public updateSubtask(
    taskId: string,
    subtaskId: string,
    updatedFields: Partial<SubTask>
  ): Observable<SubTask> {
    const url = `${this.tasksUrl}${taskId}/subtask/${subtaskId}/update/`;
    return this.http.patch<SubTask>(url, updatedFields).pipe(
      catchError((err) => {
        console.error("Fehler beim Aktualisieren des Subtasks:", err);
        return throwError(
          () => new Error("Fehler beim Aktualisieren des Subtasks")
        );
      })
    );
  }

  /**
   * Deletes a subtask from the server.
   * The request body is empty.
   * The response is the deleted subtask.
   * @param taskId The ID of the task containing the subtask.
   * @param subtaskId The ID of the subtask to delete.
   * @returns An observable that emits the deleted subtask.
   */
  public deleteSubtask(taskId: string, subtaskId: string): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/subtask/${subtaskId}/`;
    return this.http.delete<any>(url);
  }

  /**
   * Adds one or more assignees to an existing task on the server.
   * The request body is an object with a single property "assignedTo" that is an array of Contact objects.
   * The response is the updated task.
   * @param taskId The ID of the task to add assignees to.
   * @param assignedTo The array of Contact objects to add.
   * @returns An observable that emits the updated task.
   */
  public addAssignees(taskId: string, assignedTo: Contact[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/add_assignees/`;
    return this.http.post<any>(url, { assignedTo });
  }

  /**
   * Removes one or more assignees from an existing task on the server.
   *
   * Sends a POST request to the server with the IDs of the assignees to remove.
   * The response is the updated task.
   *
   * @param taskId - The ID of the task from which to remove assignees.
   * @param assignedTo - An array of IDs of the assignees to be removed.
   * @returns An observable that emits the updated task.
   */

  public removeAssignee(taskId: number, assignedTo: number[]): Observable<any> {
    const url = `${this.tasksUrl}${taskId}/remove_assignees/`;
    return this.http.post<any>(url, { assignedTo });
  }

  /**
   * Loads the contacts from the server and updates the contacts observable.
   * The contactsSubject observable will emit an empty array if there is an error.
   */
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

  /**
   * An observable that emits an array of Contact objects when the contacts are loaded or updated.
   * The observable emits an empty array if there is an error loading the contacts.
   * @returns An observable that emits an array of Contact objects.
   */
  public getContacts(): Observable<Contact[]> {
    return this.contacts$;
  }

  /**
   * Retrieves a contact by its ID from the server.
   *
   * Sends a GET request to the server to fetch the contact data associated with the given ID.
   * Upon a successful response, updates the contactDetailSubject with the retrieved contact.
   *
   * @param id - The ID of the contact to retrieve.
   * @returns An observable that emits the retrieved Contact object.
   */
  public getContactById(id: string): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.get<Contact>(url).pipe(
      map((contact) => {
        this.contactDetailSubject.next(contact);
        return contact;
      })
    );
  }

  /**
   * Creates a new contact in the server.
   *
   * Sends a POST request to the server to create a new contact with the given contact data.
   * The contact data is formatted to conform to the server's expected format.
   * Upon successful creation, the server will return the newly created contact.
   *
   * @param contact - The Contact object to create.
   * @returns An observable that emits the newly created Contact object.
   */
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

  /**
   * Updates an existing contact in the server.
   *
   * Sends a PUT request to the server to update the contact with the given ID.
   * The request body is an object with the properties to update.
   * The response is the updated contact.
   *
   * @param id - The ID of the contact to update.
   * @param updatedContact - A partial Contact object with the properties to update.
   * @returns An observable that emits the updated Contact object.
   */
  public updateContact(
    id: string,
    updatedContact: Partial<Contact>
  ): Observable<Contact> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.put<Contact>(url, updatedContact);
  }

  /**
   * Deletes a contact from the server by its ID.
   *
   * Sends a DELETE request to the server to remove the contact associated with the given ID.
   * The response is the deleted contact or a confirmation of deletion.
   *
   * @param id - The ID of the contact to delete.
   * @returns An observable that emits the server's response upon deletion.
   */
  public deleteContact(id: string): Observable<any> {
    const url = `${this.contactsUrl}${id}/`;
    return this.http.delete(url);
  }

  /**
   * Returns the due date of the next urgent task, or null if there are no urgent tasks.
   *
   * @param tasks - An array of Task objects.
   * @returns The due date of the next urgent task, or null if there are no urgent tasks.
   */
  public getNextDueDateForUrgentTasks(tasks: Task[]): string | null {
    const urgentTasks = tasks.filter((task) => task.priority === "urgent");
    urgentTasks.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
    return urgentTasks.length > 0 ? urgentTasks[0].due_date : null;
  }

  /**
   * Sets the task ID in the taskIdSubject observable.
   *
   * This method updates the current task ID by emitting the new value
   * through the taskIdSubject observable. It can be used to track
   * the task ID for further operations or updates.
   *
   * @param taskId - The new task ID to set, or null to unset the task ID.
   */
  setTaskId(taskId: string | null) {
    this.taskIdSubject.next(taskId);
  }

  /**
   * An observable that emits the current task ID as a string, or null if there is no task ID set.
   * This observable can be used to track the current task ID for further operations or updates.
   * @returns An observable that emits the current task ID as a string, or null if there is no task ID set.
   */
  getTaskId(): Observable<string | null> {
    return this.taskIdSubject.asObservable();
  }

  /**
   * Sets the current task data in the taskDataSubject observable.
   *
   * This method updates the current task data by emitting the new value
   * through the taskDataSubject observable. It can be used to track
   * the current task data for further operations or updates.
   *
   * @param task - The new task data to set, or null to unset the task data.
   */
  setTaskData(task: Task | null) {
    this.taskDataSubject.next(task);
  }

  /**
   * An observable that emits the current task data as a Task object, or null if there is no task data set.
   * This observable can be used to track the current task data for further operations or updates.
   * @returns An observable that emits the current task data as a Task object, or null if there is no task data set.
   */
  getTaskData(): Observable<Task | null> {
    return this.taskDataSubject.asObservable();
  }
}
