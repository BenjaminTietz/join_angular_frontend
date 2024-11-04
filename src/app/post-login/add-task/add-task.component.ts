import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
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
} from "@angular/forms";
import { Observable } from "rxjs";
import { Contact } from "../../models/contact.class";
import { DatabaseService } from "../../services/database.service";
import { Task } from "../../models/task.class";
import { SubTask } from "../../models/subTask.class";
import { Router } from "@angular/router";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";

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
  addTaskForm!: FormGroup;
  categories = [
    { value: "marketing", label: "Marketing", class: "marketing" },
    { value: "sales", label: "Sales", class: "sales" },
    { value: "development", label: "Development", class: "development" },
    { value: "accounting", label: "Accounting", class: "accounting" },
    { value: "purchase", label: "Purchase", class: "purchase" },
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
  @ViewChild("contactInput") contactInput!: ElementRef<HTMLInputElement>;
  constructor(
    private fb: FormBuilder,
    public databaseService: DatabaseService,
    private router: Router
  ) {
    this.addTaskForm = this.fb.group({
      taskTitle: ["", Validators.required],
      taskDescription: [""],
      taskDueDate: ["", Validators.required],
      taskPriority: ["", Validators.required],
      taskAssignedTo: this.fb.array([]),
      category: ["", Validators.required],
      subtask: [""],
      subTasks: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.contacts$ = this.databaseService.getContacts();
    this.contacts$.subscribe((contacts) => {
      this.filteredContacts = contacts;
    });
    this.databaseService.getTaskId().subscribe((taskId) => {
      this.taskId = taskId;
      console.log("TaskId in add-task:", this.taskId);
    });

    this.databaseService.getTaskData().subscribe((taskData) => {
      this.taskData = taskData;
      if (this.taskData) {
        this.loadTaskData(this.taskData);
      }
      console.log("TaskData in add-task:", this.taskData);
    });
  }

  onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask = this.createTaskObject();
      console.log("New Task:", newTask);

      if (this.taskId) {
        this.updateTask(newTask);
      } else {
        this.createNewTask(newTask);
      }
    }
  }

  private createTaskObject(): Task {
    return {
      id: this.taskId || "",
      title: this.addTaskForm.value.taskTitle,
      description: this.addTaskForm.value.taskDescription,
      dueDate: this.addTaskForm.value.taskDueDate,
      assignedTo: [],
      category: this.addTaskForm.value.category,
      priority: this.addTaskForm.value.taskPriority,
      status: this.category || "todo",
      subTasks: [],
      createdAt: new Date().toISOString(),
      createdBy: "", // todo: get current user id
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
          // todo: show "task updated" message
        });
    }
  }

  private createNewTask(task: Task) {
    this.databaseService.createTask(task).subscribe((createdTask) => {
      console.log("Task created:", createdTask);
      // todo: show "task added to board" message
      setTimeout(() => {
        this.databaseService.loadTasks();
        this.router.navigate(["/home/board"]);
      }, 500);
      this.addTaskForm.reset();
      this.handleAdditionalUpdates(createdTask.id);
    });
  }

  private handleAdditionalUpdates(taskId: string) {
    const newSubtasks = this.subTasks.filter((subTask) => !subTask.id);
    const newAssignees = this.assignedContacts.filter(
      (contact) => !this.assignedContactIds.includes(contact.id)
    ); // Nur neue Assignees

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
    console.log("Priority:", this.selectedPriority);
  }
  pushSubtaskToArray() {
    if (this.addTaskForm.value.subtask) {
      this.subTasks.push({
        title: this.addTaskForm.value.subtask,
        taskId: "",
        id: "",
        checked: false,
        createdAt: "",
        createdBy: "", // todo : get current user id
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
      taskDueDate: task.dueDate,
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
}
