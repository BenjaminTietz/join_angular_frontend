import { CommonModule } from "@angular/common";
import {
  inject,
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  HostBinding,
  Renderer2,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { Contact } from "../../models/contact.class";
import { DatabaseService } from "../../services/database.service";
import { Task } from "../../models/task.class";
import { SubTask } from "../../models/subTask.class";
import { Router } from "@angular/router";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";
import { AppComponent } from "../../app.component";
import { AuthService } from "../../services/auth.service";
import { CommunicationService } from "../../services/communication.service";
@Component({
  selector: "app-add-task",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    SidenavComponent,
  ],
  templateUrl: "./add-task.component.html",
  styleUrl: "./add-task.component.scss",
})
export class AddTaskComponent implements OnInit {
  @Input() isEmbeddedInBoard: boolean = false;
  @HostBinding("class.embedded") get embeddedClass() {
    return this.isEmbeddedInBoard;
  }
  app = inject(AppComponent);
  addTaskForm!: FormGroup;
  categories = [
    { value: "frontend-angular", label: "Frontend - Angular" },
    { value: "backend-django", label: "Backend - Django" },
    { value: "authentication", label: "Authentication" },
    { value: "deployment", label: "Deployment" },
    { value: "testing", label: "Testing" },
    { value: "project-management", label: "Project Management" },
  ];
  selectedCategory: string | null = null;
  contacts$!: Observable<Contact[]>;
  filteredContacts: Contact[] = [];
  searchTerm: string = "";
  selectedPriority: string = "";
  subTasks: SubTask[] = [];
  assignedContacts: Contact[] = [];
  editSubTaskTitle: string = "";
  @Input() category: string = "";
  taskId: string | null = null;
  taskData: Task | null = null;
  isTaskgettingEdited: boolean = false;
  lowPrioColor: string = "#7AE229";
  mediumPrioColor: string = "#FFA800";
  urgentPrioColor: string = "#FF3D00";
  assignedContactIds: string[] = [];
  showContactsToAssign: boolean = false;
  showCategories: boolean = false;
  displayFloatingAddTask: boolean = false;
  private subscriptions: Subscription = new Subscription();
  currentUserId: number = 0;
  hoveredIndex: number | null = null;
  public databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  communicationService = inject(CommunicationService);
  @ViewChild("contactInput") contactInput!: ElementRef<HTMLInputElement>;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.addTaskForm = this.fb.group({
      taskTitle: ["", Validators.required],
      taskDescription: [""],
      taskDueDate: ["", [Validators.required, this.futureDateValidator]],
      taskPriority: ["", Validators.required],
      taskAssignedTo: this.fb.array([]),
      category: ["", Validators.required],
      subtask: [""],
      subTasks: this.fb.array([]),
    });
  }
  /**
   * Initializes the component when it is created.
   * - Calls the initialization of data in the database service.
   * - Subscribes to the resetForm observable to reset the form when triggered.
   * - Fetches contacts and assigns them to the filteredContacts array.
   * - Subscribes to the taskId observable to keep track of the current task ID.
   * - Subscribes to the taskData observable and either loads the task data or resets the form.
   * - Displays the floating add task if the current route is "/board".
   * - Sets the current user ID from the authentication service.
   */
  ngOnInit(): void {
    this.initializeData();
    this.initializeSubscriptions();
    this.initializeUserAndRouterState();
  }

  /**
   * Initializes the component by calling the initializeData method of the DatabaseService
   * with true as the argument. Then, it subscribes to the contacts$ observable and assigns
   * the fetched contacts to the filteredContacts array.
   */
  private initializeData(): void {
    this.databaseService.initializeData(true);
    this.contacts$ = this.databaseService.getContacts();
    this.contacts$.subscribe((contacts) => {
      this.filteredContacts = contacts;
    });
  }

  /**
   * Initializes subscriptions to the DatabaseService and CommunicationService.
   * Subscribes to the resetForm observable of the CommunicationService to reset the form when triggered.
   * Subscribes to the taskId observable of the DatabaseService to keep track of the current task ID.
   * Subscribes to the taskData observable of the DatabaseService and either loads the task data or resets the form.
   */
  private initializeSubscriptions(): void {
    this.subscriptions.add(
      this.communicationService.resetForm$.subscribe(() => {
        this.resetForm();
      })
    );
    const taskIdSub = this.databaseService.getTaskId().subscribe((taskId) => {
      this.taskId = taskId;
    });
    this.subscriptions.add(taskIdSub);
    const taskDataSub = this.databaseService
      .getTaskData()
      .subscribe((taskData) => {
        this.taskData = taskData;
        if (this.taskData) {
          this.loadTaskData(this.taskData);
        } else {
          this.resetForm();
        }
      });
    this.subscriptions.add(taskDataSub);
  }

  /**
   * Initializes the user and router state.
   * - Sets the display of the floating add task component based on the current router URL.
   * - Retrieves and sets the current user ID from the authentication service.
   */

  private initializeUserAndRouterState(): void {
    if (this.router.url === "/board") {
      this.displayFloatingAddTask = true;
    }
    this.currentUserId = this.authService.getUserId()!;
  }

  /**
   * Refreshes the task board data by reinitializing the data and loading tasks.
   * This method updates the board with the latest tasks from the database service.
   */

  refreshBoard(): void {
    this.initializeData();
    this.databaseService.loadTasks();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Resets the form to its initial state, clearing out all fields.
   * Used when the user navigates away from the task editor or when the
   * task is successfully saved or deleted.
   */
  resetForm(): void {
    this.addTaskForm.reset();
    this.setPriority("");
    this.assignedContactIds = [];
    this.assignedContacts = [];
    this.subTasks = [];
    this.taskId = null;
    this.taskData = null;
    this.isTaskgettingEdited = false;
  }

  /**
   * Custom validator to check if the selected date is in the future.
   * Returns {pastDate: true} if the date is in the past, or null otherwise.
   */
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  /**
   * Handles the submission of the add task form.
   * If the form is valid, it creates a new task object and checks if the task ID is set.
   * If the task ID is set, it updates the task in the database.
   * If the task ID is not set, it creates a new task in the database.
   * Displays a dialog on successful completion or logs an error on failure.
   */
  onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask = this.createTaskObject();
      this.app.showDialog("Task Creation Successful");
      if (this.taskId) {
        this.updateTask(newTask);
        this.app.showDialog("Task Update Successful");
      } else {
        this.createNewTask(newTask);
        this.app.showDialog("Task Creation Successful");
      }
      this.communicationService.showAddTaskOverlay = false;
      this.refreshBoard();
    }
  }

  /**
   * Creates a new task object using the form values.
   * The task object includes the task title, description, due date, assigned contacts,
   * category, priority, status, subtasks, creation date, and the ID of the user who created the task.
   * The task ID is set to an empty string if the task is not being edited.
   * @returns The new task object.
   */
  private createTaskObject(): Task {
    return {
      id: this.taskId || "",
      title: this.addTaskForm.value.taskTitle,
      description: this.addTaskForm.value.taskDescription,
      due_date: this.addTaskForm.value.taskDueDate,
      assignedTo: [],
      category: this.addTaskForm.value.category,
      priority: this.addTaskForm.value.taskPriority,
      status: this.category || "todo",
      subTasks: [],
      createdAt: new Date().toISOString(),
      createdBy: this.currentUserId.toString(),
    };
  }

  /**
   * Updates an existing task in the database.
   * If the task ID is set, it sends an update request to the database service.
   * Subscribes to the response and handles additional updates such as
   * updating subtasks and assignees. Hides the edit task overlay and reloads tasks.
   * Displays a dialog on successful update.
   * @param task The task object containing updated information.
   */
  private updateTask(task: Task) {
    if (this.taskId) {
      this.databaseService
        .updateTask(this.taskId, task)
        .subscribe((updatedTask) => {
          this.handleAdditionalUpdates(task.id);
          this.databaseService.showEditTaskOverlay = false;
          this.databaseService.loadTasks();
          this.app.showDialog("Task Update Successful");
        });
      this.refreshBoard();
      this.databaseService.setTaskId(null);
      this.databaseService.setTaskData(null);
      this.isTaskgettingEdited = false;
    }
  }

  /**
   * Creates a new task in the database.
   * Subscribes to the response and handles additional updates such as
   * updating subtasks and assignees. Hides the add task overlay, reloads tasks,
   * and navigates to the board page. Displays a dialog on successful creation.
   * @param task The task object containing new information.
   */
  private createNewTask(task: Task) {
    this.databaseService.createTask(task).subscribe((createdTask) => {
      this.app.showDialog("Task Creation Successful");
      setTimeout(() => {
        this.databaseService.loadTasks();
        this.router.navigate(["/board"]);
      }, 500);
      this.addTaskForm.reset();
      this.handleAdditionalUpdates(createdTask.id);
    });
    this.refreshBoard();
  }

  /**
   * Handles additional updates such as updating subtasks and assignees
   * when creating or updating a task.
   * @param taskId The ID of the task to update.
   * @private
   */
  private handleAdditionalUpdates(taskId: string) {
    const newSubtasks = this.subTasks.filter((subTask) => !subTask.id);
    const newAssignees = this.assignedContacts.filter(
      (contact) => !this.assignedContactIds.includes(contact.id)
    );
    if (newSubtasks.length > 0) {
      this.databaseService.addSubtasks(taskId, newSubtasks).subscribe(() => {});
    }
    if (newAssignees.length > 0) {
      this.databaseService
        .addAssignees(taskId, newAssignees)
        .subscribe(() => {});
    }
    this.refreshBoard();
  }

  /**
   * Clears the add task form by resetting all fields to their initial state.
   * Resets the task priority, assigned contacts, and subtasks.
   * Used to clear the form when starting a new task or cancelling an edit.
   */
  onClear() {
    this.addTaskForm.reset();
    this.setPriority("");
    this.assignedContactIds = [];
    this.assignedContacts = [];
    this.subTasks = [];
    this.selectCategory("");
  }

  /**
   * Handles the checkbox change event for a contact.
   * Adds or removes the contact from the assigned contacts list based on the checkbox state.
   * Updates the form array 'taskAssignedTo' with the contact's ID if checked,
   * and removes it if unchecked.
   *
   * @param event - The event triggered by the checkbox change.
   * @param contact - The contact object associated with the checkbox.
   */
  onCheckboxChange(event: any, contact: Contact) {
    if (event.target.checked) {
      const formArray: FormArray = this.addTaskForm.get(
        "taskAssignedTo"
      ) as FormArray;
      formArray.push(new FormControl(contact.id));
      this.assignedContacts.push(contact);
    } else {
      const formArray: FormArray = this.addTaskForm.get(
        "taskAssignedTo"
      ) as FormArray;
      for (let i = 0; i < formArray.length; i++) {
        if (formArray.at(i).value === contact.id) {
          formArray.removeAt(i);
          break;
        }
      }
      this.assignedContacts = this.assignedContacts.filter(
        (c) => c.id !== contact.id
      );
    }
  }

  /**
   * Sets the selected priority to the given priority string.
   * Updates the form control value for 'taskPriority' to the given string.
   * @param priority - The priority string to be set.
   */
  setPriority(priority: string) {
    this.addTaskForm.patchValue({ taskPriority: priority });
    this.selectedPriority = priority;
  }
  /**
   * Pushes a new subtask to the subTasks array if the subtask input field is not empty.
   * The subtask is added with the title from the input field, and default values for the other properties.
   * The subtask input field is then cleared.
   */
  pushSubtaskToArray() {
    if (this.addTaskForm.value.subtask) {
      this.subTasks.push({
        title: this.addTaskForm.value.subtask,
        task: "",
        id: "",
        checked: false,
        createdAt: new Date().toISOString(),
        createdBy: this.currentUserId.toString(),
      });
      this.addTaskForm.patchValue({ subtask: "" });
    }
  }

  /**
   * Removes the subtask at the given index from the subTasks array.
   * @param index - The index of the subtask to be removed.
   */
  removeSubtaskFromArray(index: number) {
    this.subTasks.splice(index, 1);
  }

  /**
   * Hides the subtask li element and shows the subtask input field element for the subtask at the given index.
   * Sets the value of the input field to the given subtask title.
   * @param subtaskTitle - The title of the subtask to be edited.
   * @param index - The index of the subtask to be edited in the subTasks array.
   */
  handleEditSubtask(subtaskTitle: string, index: number) {
    this.editSubTaskTitle = subtaskTitle;
    const listElement = document.querySelector(
      `.subtask-container:nth-child(${index + 2}) > li`
    ) as HTMLElement;

    const inputElement = document.querySelector(
      `.subtask-container:nth-child(${index + 2}) > input`
    ) as HTMLElement;

    if (inputElement) {
      inputElement.style.display = "flex";
      listElement.style.display = "none";
    }
  }

  /**
   * Saves the edited title of a subtask if it has changed and is not empty, and toggles the edit mode.
   *
   * @param originalTitle The original title of the subtask before editing.
   * @param index The index of the subtask in the subTasks array.
   *
   * Retrieves the input and list elements for the subtask based on the index, checks if the new title
   * differs from the original and is not empty, updates the subtask title, and toggles the edit mode
   * off. Also refreshes the board to reflect changes.
   */

  saveEditedSubtask(originalTitle: string, index: number) {
    const inputElement = this.getElementBySelector<HTMLInputElement>(
      `.subtask-container:nth-child(${index + 2}) > input`
    );
    const listElement = this.getElementBySelector<HTMLElement>(
      `.subtask-container:nth-child(${index + 2}) > li`
    );

    if (inputElement) {
      const newTitle = inputElement.value.trim();
      if (newTitle && newTitle !== originalTitle) {
        this.updateSubtaskTitle(index, newTitle);
      }
      this.toggleSubtaskEditMode(inputElement, listElement, false);
    }
    this.refreshBoard();
  }

  /**
   * Updates the title of a subtask at the specified index and reflects the change in the database.
   *
   * @param index - The index of the subtask in the subTasks array to update.
   * @param newTitle - The new title to set for the subtask.
   *
   * Updates the title of the subtask in the local array. If the edit task overlay is visible,
   * it also updates the subtask title in the database and shows a success dialog upon completion.
   * Logs an error message if the update fails.
   */

  private updateSubtaskTitle(index: number, newTitle: string) {
    this.subTasks[index].title = newTitle;

    if (this.databaseService.showEditTaskOverlay) {
      const subtask = this.subTasks[index];
      this.databaseService
        .updateSubtask(subtask.task, subtask.id, { title: newTitle })
        .subscribe({
          next: (response) =>
            this.app.showDialog("Subtask updated successfully"),
          error: (err) => console.error("Error updating subtask:", err),
        });
    }
  }

  /**
   * Toggles the display mode between input and list elements based on the editing state.
   *
   * @param inputElement - The input element to display when editing is active.
   * @param listElement - The list element to display when editing is inactive.
   * @param isEditing - A boolean indicating whether the edit mode is active.
   *
   * Sets the input element's display style to "flex" when editing, otherwise hides it.
   * Conversely, it hides the list element when editing and displays it when not editing.
   */

  private toggleSubtaskEditMode(
    inputElement: HTMLElement | null,
    listElement: HTMLElement | null,
    isEditing: boolean
  ) {
    if (inputElement) inputElement.style.display = isEditing ? "flex" : "none";
    if (listElement) listElement.style.display = isEditing ? "none" : "flex";
  }

  /**
   * Gets the first element that matches the given CSS selector.
   *
   * @param selector - The CSS selector to query the document with.
   * @returns The first matching element cast to the given type, or null if no match is found.
   */
  private getElementBySelector<T extends HTMLElement>(
    selector: string
  ): T | null {
    return document.querySelector(selector) as T | null;
  }
  /**
   * Loads the given task data into the form.
   * Sets the task title, description, due date, priority, and category
   * to the given task's values.
   * Sets the assigned contacts and subtasks to the given task's values.
   * Adds the assigned contacts to the assigned contacts form array and
   * updates the assigned contact IDs list.
   * Adds the subtasks to the subtasks array and updates the subtasks form array.
   * @param task - The task to be loaded into the form.
   */
  loadTaskData(task: Task) {
    this.isTaskgettingEdited = true;
    this.addTaskForm.patchValue({
      taskTitle: task.title,
      taskDescription: task.description,
      taskDueDate: task.due_date,
      taskPriority: task.priority,
      category: task.category,
    });
    this.category = task.status;
    this.selectedPriority = task.priority;
    this.subTasks = task.subTasks;
    this.assignedContacts = task.assignedTo;
    this.assignedContactIds = task.assignedTo.map((contact) => contact.id);
    task.assignedTo.forEach((contact: Contact) => {
      this.addAssignedContact(contact);
    });
    task.subTasks.forEach((subTask: SubTask) => {
      this.addSubtask(subTask);
    });
  }

  /**
   * A getter for the 'taskAssignedTo' form array.
   * The 'taskAssignedTo' form array contains the IDs of the contacts assigned to the task.
   * @returns The 'taskAssignedTo' form array.
   */
  get taskAssignedToArray() {
    return this.addTaskForm.get("taskAssignedTo") as FormArray;
  }

  /**
   * Adds a contact to the 'taskAssignedTo' form array.
   * The contact is added as a form group with the contact's ID, name, email, initials, and color.
   * @param contact - The contact to be added.
   */
  addAssignedContact(contact: Contact) {
    const contactGroup = this.fb.group({
      id: [contact.id],
      name: [contact.name],
      email: [contact.email],
      initials: [contact.initials],
      color: [contact.color],
    });
    this.taskAssignedToArray.push(contactGroup);
  }

  /**
   * A getter for the 'subTasks' form array.
   * The 'subTasks' form array contains the subtasks of the task as form groups with the subtask's title and completed status.
   * @returns The 'subTasks' form array.
   */
  get subTasksArray() {
    return this.addTaskForm.get("subTasks") as FormArray;
  }

  /**
   * Adds a subtask to the 'subTasks' form array.
   * The subtask is added as a form group with the subtask's title and completed status.
   * @param subTask - The subtask to be added.
   */
  addSubtask(subTask: SubTask) {
    const subtaskGroup = this.fb.group({
      title: [subTask.title, Validators.required],
      completed: [subTask.checked],
    });
    this.subTasksArray.push(subtaskGroup);
  }

  /**
   * Deletes a subtask by its ID.
   * Removes the subtask from the 'subTasks' form array and from the database if the task ID is present.
   * If the task ID is not present, logs an error message to the console.
   * @param subtaskId - The ID of the subtask to be deleted.
   * @param index - The index of the subtask in the 'subTasks' form array.
   */
  deleteSubtask(subtaskId: string, index: string) {
    this.subTasks.splice(Number(index), 1);
    if (this.taskId) {
      this.databaseService
        .deleteSubtask(this.taskId, subtaskId)
        .subscribe((res) => {});
    } else {
      console.error("Task ID is null, cannot delete subtask.");
    }
  }

  /**
   * Toggles the visibility of the contacts list for assigning contacts to the task.
   * If the contacts list is shown, it also focuses on the search input field.
   * @param event - The event that triggered this function (optional).
   */
  toggleShowContactsToAssign(event?: Event) {
    if (event) event.stopPropagation();
    this.showContactsToAssign = !this.showContactsToAssign;
    if (this.showContactsToAssign) {
      this.contacts$.subscribe((contacts) => {
        this.filteredContacts = contacts;
      });
      setTimeout(() => {
        if (this.contactInput) {
          this.contactInput.nativeElement.focus();
        }
      });
    }
  }
  /**
   * Stops the propagation of the given event.
   * @param event The event whose propagation is to be stopped.
   */
  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Filters the contacts list based on the given search input.
   * @param event The event that triggered this function.
   */
  onSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = input;

    if (this.searchTerm === "") {
      this.contacts$.subscribe((contacts) => {
        this.filteredContacts = contacts;
      });
    } else {
      this.filteredContacts = this.filteredContacts.filter((contact) =>
        contact.name.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  /**
   * Toggles the visibility of the categories list for selecting the task category.
   * If the categories list is shown, it also stops the propagation of the given event.
   * @param event The event that triggered this function (optional).
   */
  toggleShowCategories(event?: Event) {
    if (event) event.stopPropagation();
    this.showCategories = !this.showCategories;
  }

  /**
   * Selects a category from the list and updates the form control with the formatted category value.
   * The category value is formatted to have the first letter in uppercase.
   * Closes the categories list after selection.
   * @param value - The category value to be selected.
   */
  selectCategory(value: string) {
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    this.addTaskForm.get("category")?.setValue(formattedValue);
    this.selectedCategory = formattedValue;
    this.showCategories = false;
  }

  /**
   * Removes an assigned contact from the task.
   *
   * Removes the contact from the assigned contacts list and the taskAssignedTo form array
   * by the provided index. Updates the assigned contact IDs list to exclude the removed contact's ID.
   * If the task ID exists, it sends a request to the database to remove the assignee.
   * Displays a success dialog upon successful removal or logs an error if the removal fails.
   * Refreshes the board to reflect the changes.
   *
   * @param contact - The contact to be removed from the task.
   * @param index - The index of the contact in the assigned contacts list to be removed.
   */

  removeAssignedContact(contact: Contact, index: number) {
    this.assignedContacts.splice(index, 1);
    this.taskAssignedToArray.removeAt(index);
    this.assignedContactIds = this.assignedContactIds.filter(
      (id) => id !== contact.id
    );
    if (this.taskId) {
      this.databaseService
        .removeAssignee(Number(this.taskId), [Number(contact.id)])
        .subscribe({
          next: () => {
            this.app.showDialog("Contact removed from task");
          },
          error: (error) => {
            console.error("Error removing contact from task:", error);
          },
        });
      this.refreshBoard();
    }
  }
}
