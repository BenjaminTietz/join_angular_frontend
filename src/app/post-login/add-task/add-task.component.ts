import { CommonModule } from "@angular/common";
import {
  inject,
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
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
  public databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  communicationService = inject(CommunicationService);
  @ViewChild("contactInput") contactInput!: ElementRef<HTMLInputElement>;
  constructor(private fb: FormBuilder, private router: Router) {
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
  ngOnInit(): void {
    this.subscriptions.add(
      this.communicationService.resetForm$.subscribe(() => {
        this.resetForm();
      })
    );
    this.contacts$ = this.databaseService.getContacts();
    const contactsSub = this.contacts$.subscribe((contacts) => {
      this.filteredContacts = contacts;
    });
    this.subscriptions.add(contactsSub);
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

    if (this.router.url === "/board") {
      this.displayFloatingAddTask = true;
    }
    this.currentUserId = this.authService.getUserId()!;
    console.log("User ID:", this.currentUserId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask = this.createTaskObject();
      console.log("New Task:", newTask);
      this.app.showDialog("Task Creation Successful");
      if (this.taskId) {
        this.updateTask(newTask);
        this.app.showDialog("Task Update Successful");
      } else {
        this.createNewTask(newTask);
        this.app.showDialog("Task Creation Successful");
      }
    }
  }

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

  private updateTask(task: Task) {
    if (this.taskId) {
      this.databaseService
        .updateTask(this.taskId, task)
        .subscribe((updatedTask) => {
          console.log("Task updated:", updatedTask);
          this.handleAdditionalUpdates(task.id);
          this.databaseService.showEditTaskOverlay = false;
          this.app.showDialog("Task Update Successful");
        });
    }
  }

  private createNewTask(task: Task) {
    this.databaseService.createTask(task).subscribe((createdTask) => {
      console.log("Task created:", createdTask);
      this.app.showDialog("Task Creation Successful");
      setTimeout(() => {
        this.databaseService.loadTasks();
        this.router.navigate(["/board"]);
      }, 500);
      this.addTaskForm.reset();
      this.handleAdditionalUpdates(createdTask.id);
    });
  }

  private handleAdditionalUpdates(taskId: string) {
    const newSubtasks = this.subTasks.filter((subTask) => !subTask.id);
    const newAssignees = this.assignedContacts.filter(
      (contact) => !this.assignedContactIds.includes(contact.id)
    );

    if (newSubtasks.length > 0) {
      this.databaseService.addSubtasks(taskId, newSubtasks).subscribe(() => {
        console.log("Neue Subtasks erfolgreich hinzugefügt");
      });
    }

    if (newAssignees.length > 0) {
      this.databaseService.addAssignees(taskId, newAssignees).subscribe(() => {
        console.log("Neue Assignees erfolgreich hinzugefügt");
      });
    }
  }

  onClear() {
    this.addTaskForm.reset();
    this.setPriority("");
    this.assignedContactIds = [];
    this.assignedContacts = [];
    this.subTasks = [];
  }

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
    console.log("Assigned Contacts:", this.assignedContacts);
  }

  setPriority(priority: string) {
    this.addTaskForm.patchValue({ taskPriority: priority });
    this.selectedPriority = priority;
  }
  pushSubtaskToArray() {
    if (this.addTaskForm.value.subtask) {
      this.subTasks.push({
        title: this.addTaskForm.value.subtask,
        taskId: "",
        id: "",
        checked: false,
        createdAt: new Date().toISOString(),
        createdBy: this.currentUserId.toString(),
      });
      this.addTaskForm.patchValue({ subtask: "" });
    }
    console.log("Subtasks:", this.subTasks);
  }
  removeSubtaskFromArray(index: number) {
    this.subTasks.splice(index, 1);
  }
  handleEditSubtask(subtaskTitle: string, index: number) {
    console.log("Edit subtask index", index);
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
  saveEditedSubtask(originalTitle: string, index: number) {
    const inputElement = document.querySelector(
      `.subtask-container:nth-child(${index + 2}) > input`
    ) as HTMLInputElement;

    if (inputElement) {
      const newTitle = inputElement.value;
      if (newTitle !== originalTitle) {
        this.subTasks[index].title = newTitle;
        console.log("Updated subtask title:", newTitle);
      } else {
        console.log("No changes made.");
      }
      const listElement = document.querySelector(
        `.subtask-container:nth-child(${index + 2}) > li`
      ) as HTMLElement;

      if (listElement) {
        inputElement.style.display = "none";
        listElement.style.display = "flex";
      }
    }
    console.log("Subtasks:", this.subTasks);
  }

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

  get taskAssignedToArray() {
    return this.addTaskForm.get("taskAssignedTo") as FormArray;
  }

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

  get subTasksArray() {
    return this.addTaskForm.get("subTasks") as FormArray;
  }

  addSubtask(subTask: SubTask) {
    const subtaskGroup = this.fb.group({
      title: [subTask.title, Validators.required],
      completed: [subTask.checked],
    });
    this.subTasksArray.push(subtaskGroup);
  }

  deleteSubtask(subtaskId: string, index: string) {
    this.subTasks.splice(Number(index), 1);
    console.log("Subtasks:", this.subTasks);
    if (this.taskId) {
      this.databaseService
        .deleteSubtask(this.taskId, subtaskId)
        .subscribe((res) => {
          console.log("Subtask deleted:", res);
        });
    } else {
      console.error("Task ID is null, cannot delete subtask.");
    }
  }

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
  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  onSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = input;
    this.filteredContacts = this.filteredContacts.filter((contact) =>
      contact.name.toLowerCase().includes(this.searchTerm)
    );
  }

  toggleShowCategories(event?: Event) {
    if (event) event.stopPropagation();
    this.showCategories = !this.showCategories;
  }

  selectCategory(value: string) {
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    this.addTaskForm.get("category")?.setValue(formattedValue);
    this.showCategories = false;
    console.log("Selected category:", value);
    console.log("Selected category:", formattedValue);
  }
}
