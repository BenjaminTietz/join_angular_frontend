import { Component, OnInit, output } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../models/task.class';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AddTaskComponent } from '../add-task/add-task.component';
import { SubTask } from '../../models/subTask.class';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, AddTaskComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  priorityIcons: { [key in 'urgent' | 'medium' | 'low']: string } = {
    urgent: '/assets/img/icons/task_prio_urgent.png',
    medium: '/assets/img/icons/task_prio_medium.png',
    low: '/assets/img/icons/task_prio_low.png',
  };
  showAddTaskOverlay = false;
  showTaskDetailOverlay = false;
  selectedStaus = '';
  selectedCategory = '';
  daggedTaskId = '';
  draggedTaskIndex = 0;
  selectedTaskId: string | null = null;
  selectedTask: Task | null = null;

  ngOnInit(): void {}

  constructor(public databaseService: DatabaseService) {}

  getPriorityIcon(priority: string): string {
    return (
      this.priorityIcons[priority as 'urgent' | 'medium' | 'low'] ||
      '/assets/img/icons/task_prio_default.png'
    );
  }

  handleShowAddTaskOverlay(status: string) {
    this.showAddTaskOverlay = true;
    this.selectedStaus = status;
    console.log(status);
  }
  handleCloseAddTaskOverlay() {
    this.showAddTaskOverlay = false;
  }

  //drag and drop

  onDrag(event: DragEvent, index: number, taskId: string, status: string) {
    console.log('onDrag', index);
    console.log('taskId', taskId);
    console.log('status', status);
    this.daggedTaskId = taskId;
    this.draggedTaskIndex = index;
  }

  onDrop(event: DragEvent, status: string) {
    event.preventDefault();
    console.log('Dropped status:', status);
    const sourceArray = this.getSourceArrayByTaskId(this.daggedTaskId);
    if (sourceArray.length > 0) {
      this.databaseService
        .updateTask(this.daggedTaskId, {
          status: status,
        })
        .subscribe((updatedTask) => {
          console.log('Task updated:', updatedTask);
          this.moveTaskBetweenArrays(
            this.draggedTaskIndex,
            sourceArray,
            status
          );
        });
    } else {
      console.error('Task not found in any array.');
    }
  }

  onDragOver(event: any, status: string) {
    event.preventDefault();
    console.log('onDragOver', status);
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
    if (status === 'todo') {
      targetArray = this.databaseService.todoTasks;
    } else if (status === 'inProgress') {
      targetArray = this.databaseService.inProgressTasks;
    } else if (status === 'awaitFeedback') {
      targetArray = this.databaseService.awaitFeedbackTasks;
    } else if (status === 'done') {
      targetArray = this.databaseService.doneTasks;
    }
    const [task] = sourceArray.splice(index, 1);
    console.log('old Task status:', task.status);
    task.status = status;
    console.log('new Task status:', task.status);
    targetArray.push(task);
  }

  handleShowTaskDetailOverlay(task: Task) {
    console.log('Task to be shown:', task);
    this.selectedTask = task;
    this.selectedTaskId = task.id;
    this.showTaskDetailOverlay = true;
  }

  handleCloseTaskDetailOverlay() {
    this.showTaskDetailOverlay = false;
  }

  openTaskEditor(task: Task) {
    this.showTaskDetailOverlay = false;
    this.selectedTaskId = task.id;
    this.selectedTask = task;
    this.databaseService.setTaskId(this.selectedTaskId);
    this.databaseService.setTaskData(this.selectedTask);
    console.log('Task to edit:', task);
    console.log('Task id:', this.selectedTaskId);
    this.databaseService.showEditTaskOverlay = true;
  }

  handleTaskSaved(updatedTask: Task) {
    console.log('Task wurde gespeichert:', updatedTask);
    this.showAddTaskOverlay = false;
    // todo : update task in the array
  }

  toggleCheckBox(task: Task, subTask: SubTask) {
    console.log('Task to be updated:', task);
    console.log('Subtask checked:', subTask.id);
    subTask.checked = !subTask.checked;
    this.databaseService
      .updateSubtaskStatus(task.id, subTask.id, subTask.checked)
      .subscribe({
        next: (response) => {
          console.log('Subtask status updated', response);
        },
        error: (error) => {
          console.error('Error updating subtask status', error);
        },
        complete: () => {
          console.log('Update complete');
        },
      });
  }

  handleDeleteTask(task: Task) {
    console.log('Task to be deleted:', task);
    this.databaseService.deleteTask(task.id).subscribe({
      next: (response) => {
        console.log('Task deleted:', response);
      },
      error: (error) => {
        console.error('Error deleting task', error);
      },
      complete: () => {
        console.log('Delete complete');
      },
    });
  }
  handleCloseEditTaskOverlay() {
    this.databaseService.showEditTaskOverlay = false;
    this.selectedTaskId = null;
    this.selectedTask = null;
  }
  getCompletedSubtasks(task: Task): number {
    if (task.subTasks && task.subTasks.length > 0) {
      return task.subTasks.filter((subtask) => subtask.checked).length;
    }
    return 0;
  }
}
