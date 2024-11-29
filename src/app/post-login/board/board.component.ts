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
    urgent: "/assets/img/icons/task_prio_urgent.svg",
    medium: "/assets/img/icons/task_prio_medium.svg",
    low: "/assets/img/icons/task_prio_low.svg",
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

  /**
   * Called when the component is initialized.
   * Initializes the task data by calling the {@link DatabaseService}'s initializeData method.
   * Subscribes to the tasks$ observable and stores the tasks in the allTasks and filteredTasks fields.
   * Adds the subscription to the subscriptions field.
   */
  ngOnInit(): void {
    this.databaseService.initializeData(true);
    const tasksSub = this.databaseService.getTasks().subscribe((tasks) => {
      this.allTasks = tasks;
      this.filteredTasks = tasks;
    });
    this.subscriptions.add(tasksSub);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Transforms a category string by capitalizing the first letter and lowercasing the rest.
   * If the category string is empty, it is returned as is.
   * @param category The category string to transform.
   * @returns The transformed category string.
   */
  transformCategory(category: string): string {
    if (!category) return category;
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Filters the tasks based on the search query.
   * If the search query is empty, shows all tasks.
   * Otherwise, shows only the tasks that contain the search query in their title, description, category, assignedTo, subTasks or priority.
   */
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

  /**
   * Retrieves the icon path corresponding to the given priority level.
   * If the priority level is not recognized, returns the default icon path for low priority.
   * @param priority - The priority level of the task, should be one of "urgent", "medium", or "low".
   * @returns The file path of the icon representing the specified priority level.
   */
  getPriorityIcon(priority: string): string {
    return (
      this.priorityIcons[priority as "urgent" | "medium" | "low"] ||
      "/assets/img/icons/task_prio_low.svg"
    );
  }

  /**
   * Toggles the visibility of the add task overlay and resets the form.
   * @param status The status of the task to be added, should be one of "todo", "inProgress", or "done".
   */
  handleShowAddTaskOverlay(status: string) {
    this.communicationService.triggerResetForm();
    this.showAddTaskOverlay = true;
    this.selectedStaus = status;
  }
  /**
   * Closes the add task overlay and resets the form.
   * @param event The event that triggered the function.
   */
  handleCloseAddTaskOverlay(event: Event) {
    event.stopPropagation();
    this.showAddTaskOverlay = false;
    this.communicationService.triggerResetForm();
  }

  //drag and drop

  /**
   * Handles the drag start event for a task.
   * Sets the dragged task's ID, index, and the status from which the drag originated.
   *
   * @param event - The drag event.
   * @param index - The index of the task being dragged.
   * @param taskId - The ID of the task being dragged.
   * @param status - The status column from which the task is being dragged.
   */
  onDrag(event: DragEvent, index: number, taskId: string, status: string) {
    this.draggedTaskId = taskId;
    this.draggedTaskIndex = index;
    this.isDragFrom = status;
  }

  /**
   * Handles the drop event for a task.
   * Moves the task between the source array and the target array,
   * and updates the task status in the database.
   * @param event - The drop event.
   * @param status - The status of the target array.
   */
  onDrop(event: DragEvent, status: string) {
    event.preventDefault();
    this.isDragOver[status] = false;

    if (!this.draggedTaskId) {
      console.error("Dragged task ID is not set.");
      return;
    }

    this.isDragFrom = null;
    const sourceArray = this.getSourceArrayByTaskId(this.draggedTaskId);
    if (!sourceArray) {
      console.error("Source array not found.");
      return;
    }

    this.databaseService.updateTask(this.draggedTaskId, { status }).subscribe({
      next: (updatedTask) => {
        this.moveTaskBetweenArrays(this.draggedTaskIndex, sourceArray, status);
        this.filterTasks();
        this.ngOnInit();
      },
      error: (err) => {
        console.error("Error updating task:", err);
      },
    });
  }

  /**
   * Handles the dragover event for a task.
   * Sets the isDragOver flag to true for the target array,
   * and sets it to false for all other arrays.
   * @param event - The dragover event.
   * @param status - The status of the target array.
   */
  onDragOver(event: DragEvent, status: string) {
    event.preventDefault();
    Object.keys(this.isDragOver).forEach((key) => {
      this.isDragOver[key] = false;
    });
    this.isDragOver[status] = true;
  }

  /**
   * Handles the dragend event for a task.
   * Resets the isDragFrom flag, isDragOver flags for all arrays, and
   * resets the draggedTaskId and draggedTaskIndex.
   * @param event - The dragend event.
   */
  onDragEnd(event: DragEvent) {
    this.isDragFrom = null;
    Object.keys(this.isDragOver).forEach((key) => {
      this.isDragOver[key] = false;
    });
    this.draggedTaskId = "";
    this.draggedTaskIndex = 0;
  }

  /**
   * Handles the dragleave event for a task.
   * If the event target is the current target, sets the isDragOver flag to false for the target array.
   * @param event - The dragleave event.
   * @param status - The status of the target array.
   */
  onDragLeave(event: DragEvent, status: string) {
    event.preventDefault();
    if (event.currentTarget === event.target) {
      this.isDragOver[status] = false;
    }
  }

  /**
   * Handles the click event for a task to move it to a new status.
   * Retrieves the source array of the task, updates the task in the database,
   * moves the task between arrays in the component, and calls ngOnInit.
   * @param taskId - The ID of the task to move.
   * @param index - The index of the task in the source array.
   * @param status - The new status of the task.
   */
  handleMoveToNewStatus(taskId: string, index: number, status: string) {
    const sourceArray = this.getSourceArrayByTaskId(taskId);
    this.databaseService
      .updateTask(taskId, {
        status: status,
      })
      .subscribe((updatedTask) => {
        this.moveTaskBetweenArrays(index, sourceArray, status);
      });
    this.ngOnInit();
    this.filterTasks();
  }
  /**
   * Retrieves the source array of a task by its ID.
   * @param taskId - The ID of the task to find.
   * @returns The source array of the task, or an empty array if the task is not found.
   */
  getSourceArrayByTaskId(taskId: string): Task[] {
    const todoTask = this.databaseService.todoTasks.find(
      (task) => task.id === taskId
    );
    if (todoTask) return this.databaseService.todoTasks;

    const inProgressTask = this.databaseService.inProgressTasks.find(
      (task) => task.id === taskId
    );
    if (inProgressTask) return this.databaseService.inProgressTasks;

    const awaitFeedbackTask = this.databaseService.awaitFeedbackTasks.find(
      (task) => task.id === taskId
    );
    if (awaitFeedbackTask) return this.databaseService.awaitFeedbackTasks;

    const doneTask = this.databaseService.doneTasks.find(
      (task) => task.id === taskId
    );
    if (doneTask) return this.databaseService.doneTasks;

    console.warn(`Task with ID ${taskId} not found in any array.`);
    return [];
  }
  /**
   * Moves a task between the source array and the target array, and updates the task status.
   * @param index - The index of the task in the source array.
   * @param sourceArray - The source array of the task.
   * @param status - The new status of the task.
   */
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
    task.status = status;
    targetArray.push(task);
    this.filterTasks();
  }

  /**
   * Shows the task detail overlay for the given task.
   * @param task The task to show in the overlay.
   */
  handleShowTaskDetailOverlay(task: Task) {
    this.selectedTask = task;
    this.selectedTaskId = task.id;
    this.showTaskDetailOverlay = true;
  }

  /**
   * Closes the task detail overlay and resets the form.
   * @param event The event that triggered the function.
   */
  handleCloseTaskDetailOverlay(event: Event) {
    event.stopPropagation();
    this.showTaskDetailOverlay = false;
    this.databaseService.setTaskId("");
    this.databaseService.setTaskData(null);
    this.communicationService.triggerResetForm();
  }

  /**
   * Opens the task editor for the given task.
   * Sets the selectedTaskId, selectedTask, and the task in the database service,
   * and shows the edit task overlay.
   * @param task The task to edit.
   */
  openTaskEditor(task: Task) {
    this.showTaskDetailOverlay = false;
    this.selectedTaskId = task.id;
    this.selectedTask = task;
    this.databaseService.setTaskId(this.selectedTaskId);
    this.databaseService.setTaskData(this.selectedTask);
    this.databaseService.showEditTaskOverlay = true;
  }

  /**
   * Handles the event when a task is saved.
   * Logs the saved task, hides the add task overlay,
   * and updates the task in the array (to be implemented).
   * @param updatedTask The task object that was saved.
   */
  handleTaskSaved(updatedTask: Task) {
    console.log("Task wurde gespeichert:", updatedTask);
    this.showAddTaskOverlay = false;
    // todo : update task in the array
  }

  /**
   * Toggles the checked status of a subtask and updates it in the database.
   *
   * @param task The parent task containing the subtask.
   * @param subTask The subtask whose checked status needs to be toggled.
   *
   * Subscribes to the updateSubtaskStatus method of the database service to handle
   * the asynchronous update operation. Logs an error message if the update fails
   * and shows a success dialog upon completion.
   */
  toggleCheckBox(task: Task, subTask: SubTask) {
    subTask.checked = !subTask.checked;
    this.databaseService
      .updateSubtaskStatus(task.id, subTask.id, subTask.checked)
      .subscribe({
        next: (response) => {},
        error: (error) => {
          console.error("Error updating subtask status", error);
        },
        complete: () => {
          this.app.showDialog("SubTask Update Successful");
        },
      });
  }
  // todo confirm delete task first before deleting
  handleDeleteTask(task: Task) {
    this.databaseService.deleteTask(task.id).subscribe({
      next: (response) => {
        this.app.showDialog("Task Delete Successful");
      },
      error: (error) => {
        console.error("Error deleting task", error);
      },
      complete: () => {
        this.app.showDialog("Task Delete Successful");
      },
    });
  }
  /**
   * Closes the edit task overlay and resets task-related state.
   *
   * @param event The event that triggered the close action, used to stop propagation.
   *
   * Sets the visibility of the edit task overlay to false, clears the selected task
   * and task ID, resets task data in the database service, and triggers a form reset
   * through the communication service.
   */
  handleCloseEditTaskOverlay(event: Event) {
    event.stopPropagation();
    this.databaseService.showEditTaskOverlay = false;
    this.selectedTaskId = null;
    this.selectedTask = null;
    this.databaseService.setTaskData(null);
    this.databaseService.setTaskId(null);
    this.communicationService.triggerResetForm();
  }
  /**
   * Returns the number of completed subtasks associated with a given task.
   * @param task The task whose subtasks should be checked.
   * @returns The number of completed subtasks (0 if the task has no subtasks).
   */
  getCompletedSubtasks(task: Task): number {
    if (task.subTasks && task.subTasks.length > 0) {
      return task.subTasks.filter((subtask) => subtask.checked).length;
    }
    return 0;
  }

  /**
   * Stops the propagation of the given event.
   *
   * @param event The event whose propagation is to be stopped.
   */
  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Returns true if any task in the filtered tasks has the given status.
   * @param status The status to search for.
   * @returns True if any task has the given status, false otherwise.
   */
  hasTasksWithStatus(status: string): boolean {
    return this.filteredTasks.some((task) => task.status === status);
  }
  /**
   * Filters and returns a list of tasks with the specified status.
   *
   * @param status The status to filter tasks by.
   * @returns An array of tasks that match the given status.
   */
  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter((task) => task.status === status);
  }
}
