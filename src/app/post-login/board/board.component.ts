import { inject, Component, OnDestroy, OnInit, output } from "@angular/core";
import { DatabaseService } from "../../services/database.service";
import { Task } from "../../models/task.class";
import { Observable, Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { AddTaskComponent } from "../add-task/add-task.component";
import { SubTask } from "../../models/subTask.class";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";
import { FormsModule } from "@angular/forms";
import { CapitalizeFirstPipe } from "../../pipes/capitalize-first.pipe";
import { AppComponent } from "../../app.component";
import { CommunicationService } from "../../services/communication.service";
@Component({
  selector: "app-board",
  standalone: true,
  imports: [
    CommonModule,
    AddTaskComponent,
    HeaderComponent,
    SidenavComponent,
    FormsModule,
    CapitalizeFirstPipe,
  ],
  templateUrl: "./board.component.html",
  styleUrl: "./board.component.scss",
})
export class BoardComponent implements OnInit, OnDestroy {
  app = inject(AppComponent);
  public databaseService = inject(DatabaseService);
  communicationService = inject(CommunicationService);
  tasks$!: Observable<Task[]>;
  allTasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchQuery: string = "";
  private subscriptions: Subscription = new Subscription();
  priorityIcons: { [key in "urgent" | "medium" | "low"]: string } = {
    urgent: "/assets/img/icons/task_prio_urgent.png",
    medium: "/assets/img/icons/task_prio_medium.png",
    low: "/assets/img/icons/task_prio_low.png",
  };
  showAddTaskOverlay = false;
  showTaskDetailOverlay = false;
  selectedStaus = "";
  selectedCategory = "";
  draggedTaskId = "";
  draggedTaskIndex = 0;
  isDragOver: { [key: string]: boolean } = {};
  isDragFrom: string | null = null;
  selectedTaskId: string | null = null;
  selectedTask: Task | null = null;
  constructor() {}
  ngOnInit(): void {
    this.databaseService.initializeData(true);
    const tasksSub = this.databaseService.getTasks().subscribe((tasks) => {
      this.allTasks = tasks;
      this.filteredTasks = tasks;
    });
    this.subscriptions.add(tasksSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    console.log("BoardComponent destroyed and subscriptions unsubscribed.");
  }

  transformCategory(category: string): string {
    if (!category) return category;
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  filterTasks(): void {
    const query = this.searchQuery.toLowerCase();
    if (query === "") {
      this.filteredTasks = this.allTasks;
    } else {
      this.filteredTasks = this.allTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query) ||
          task.assignedTo.some((assignee) =>
            assignee.name.toLowerCase().includes(query)
          ) ||
          task.subTasks.some((subtask) =>
            subtask.title.toLowerCase().includes(query)
          ) ||
          task.priority.toLowerCase().includes(query)
      );
    }
  }

  getPriorityIcon(priority: string): string {
    return (
      this.priorityIcons[priority as "urgent" | "medium" | "low"] ||
      "/assets/img/icons/task_prio_default.png"
    );
  }

  handleShowAddTaskOverlay(status: string) {
    this.communicationService.triggerResetForm();
    this.showAddTaskOverlay = true;
    this.selectedStaus = status;
    console.log(status);
  }
  handleCloseAddTaskOverlay(event: Event) {
    event.stopPropagation();
    this.showAddTaskOverlay = false;
    this.communicationService.triggerResetForm();
  }

  //drag and drop

  onDrag(event: DragEvent, index: number, taskId: string, status: string) {
    console.log("onDrag", index);
    console.log("taskId", taskId);
    console.log("status", status);
    this.draggedTaskId = taskId;
    this.draggedTaskIndex = index;
    this.isDragFrom = status;
  }

  onDrop(event: DragEvent, status: string) {
    event.preventDefault();
    this.isDragOver[status] = false;
    this.isDragFrom = null;

    console.log("Dropped status:", status);

    if (!this.draggedTaskId) {
      console.error(
        "No task ID found. Please check if draggedTaskId is set correctly."
      );
      return;
    }

    const sourceArray = this.getSourceArrayByTaskId(this.draggedTaskId);
    if (sourceArray && sourceArray.length > 0) {
      this.databaseService
        .updateTask(this.draggedTaskId, { status })
        .subscribe({
          next: (updatedTask) => {
            console.log("Task updated:", updatedTask);
            this.moveTaskBetweenArrays(
              this.draggedTaskIndex,
              sourceArray,
              status
            );
          },
          error: (err) => {
            console.error("Error updating task:", err);
            if (err.status === 404) {
              alert("Task not found. Please refresh the page.");
            }
          },
        });
    } else {
      console.error("Task not found in any array.");
    }
  }

  onDragOver(event: DragEvent, status: string) {
    event.preventDefault();
    Object.keys(this.isDragOver).forEach((key) => {
      this.isDragOver[key] = false;
    });
    this.isDragOver[status] = true;

    console.log("onDragOver", status);
  }

  onDragEnd(event: DragEvent) {
    this.isDragFrom = null;
    Object.keys(this.isDragOver).forEach((key) => {
      this.isDragOver[key] = false;
    });
    console.log("onDragEnd");
  }

  onDragLeave(event: DragEvent, status: string) {
    event.preventDefault();
    if (event.currentTarget === event.target) {
      this.isDragOver[status] = false;
      console.log("onDragLeave", status);
    }
  }

  handleMoveToNewStatus(taskId: string, index: number, status: string) {
    console.log("status", status);
    const sourceArray = this.getSourceArrayByTaskId(taskId);
    this.databaseService
      .updateTask(taskId, {
        status: status,
      })
      .subscribe((updatedTask) => {
        console.log("Task updated:", updatedTask);
        this.moveTaskBetweenArrays(index, sourceArray, status);
      });
    this.ngOnInit();
  }
  getSourceArrayByTaskId(taskId: string): Task[] {
    if (this.databaseService.todoTasks.some((task) => task.id === taskId)) {
      return this.databaseService.todoTasks;
    } else if (
      this.databaseService.inProgressTasks.some((task) => task.id === taskId)
    ) {
      return this.databaseService.inProgressTasks;
    } else if (
      this.databaseService.awaitFeedbackTasks.some((task) => task.id === taskId)
    ) {
      return this.databaseService.awaitFeedbackTasks;
    } else if (
      this.databaseService.doneTasks.some((task) => task.id === taskId)
    ) {
      return this.databaseService.doneTasks;
    }
    return [];
  }
  moveTaskBetweenArrays(index: number, sourceArray: Task[], status: string) {
    let targetArray: Task[] = [];
    if (status === "todo") {
      targetArray = this.databaseService.todoTasks;
    } else if (status === "inProgress") {
      targetArray = this.databaseService.inProgressTasks;
    } else if (status === "awaitFeedback") {
      targetArray = this.databaseService.awaitFeedbackTasks;
    } else if (status === "done") {
      targetArray = this.databaseService.doneTasks;
    }
    const [task] = sourceArray.splice(index, 1);
    console.log("old Task status:", task.status);
    task.status = status;
    console.log("new Task status:", task.status);
    targetArray.push(task);
  }

  handleShowTaskDetailOverlay(task: Task) {
    console.log("Task to be shown:", task);
    this.selectedTask = task;
    this.selectedTaskId = task.id;
    this.showTaskDetailOverlay = true;
  }

  handleCloseTaskDetailOverlay(event: Event) {
    console.log("Close Task Detail Overlay");
    event.stopPropagation();
    this.showTaskDetailOverlay = false;
    this.databaseService.setTaskId("");
    this.databaseService.setTaskData(null);
    this.communicationService.triggerResetForm();
  }

  openTaskEditor(task: Task) {
    this.showTaskDetailOverlay = false;
    this.selectedTaskId = task.id;
    this.selectedTask = task;
    this.databaseService.setTaskId(this.selectedTaskId);
    this.databaseService.setTaskData(this.selectedTask);
    console.log("Task to edit:", task);
    console.log("Task id:", this.selectedTaskId);
    this.databaseService.showEditTaskOverlay = true;
  }

  handleTaskSaved(updatedTask: Task) {
    console.log("Task wurde gespeichert:", updatedTask);
    this.showAddTaskOverlay = false;
    // todo : update task in the array
  }

  toggleCheckBox(task: Task, subTask: SubTask) {
    console.log("Task to be updated:", task);
    console.log("Subtask checked:", subTask.id);
    subTask.checked = !subTask.checked;
    this.databaseService
      .updateSubtaskStatus(task.id, subTask.id, subTask.checked)
      .subscribe({
        next: (response) => {
          console.log("Subtask status updated", response);
        },
        error: (error) => {
          console.error("Error updating subtask status", error);
        },
        complete: () => {
          console.log("Update complete");
          this.app.showDialog("SubTask Update Successful");
        },
      });
  }
  // todo confirm delete task first before deleting
  handleDeleteTask(task: Task) {
    console.log("Task to be deleted:", task);
    this.databaseService.deleteTask(task.id).subscribe({
      next: (response) => {
        console.log("Task deleted:", response);
      },
      error: (error) => {
        console.error("Error deleting task", error);
      },
      complete: () => {
        console.log("Delete complete");
        this.app.showDialog("Task Delete Successful");
      },
    });
  }
  handleCloseEditTaskOverlay(event: Event) {
    event.stopPropagation();
    this.databaseService.showEditTaskOverlay = false;
    this.selectedTaskId = null;
    this.selectedTask = null;
    this.databaseService.setTaskData(null);
    this.databaseService.setTaskId(null);
    this.communicationService.triggerResetForm();
  }
  getCompletedSubtasks(task: Task): number {
    if (task.subTasks && task.subTasks.length > 0) {
      return task.subTasks.filter((subtask) => subtask.checked).length;
    }
    return 0;
  }

  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  hasTasksWithStatus(status: string): boolean {
    return this.filteredTasks.some((task) => task.status === status);
  }
  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter((task) => task.status === status);
  }
}
