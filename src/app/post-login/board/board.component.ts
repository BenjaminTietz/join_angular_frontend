import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../models/task.class';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AddTaskComponent } from '../add-task/add-task.component';

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
  selectedStaus = '';
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  awaitFeedbackTasks: Task[] = [];
  doneTasks: Task[] = [];
  daggedTaskId = '';

  ngOnInit(): void {
    this.tasks$ = this.databaseService.getTasks();
    this.tasks$.subscribe((tasks) => {
      console.log('Tasks received:', tasks);

      this.todoTasks = tasks.filter((task) => task.status === 'todo');
      this.inProgressTasks = tasks.filter(
        (task) => task.status === 'inProgress'
      );
      this.awaitFeedbackTasks = tasks.filter(
        (task) => task.status === 'awaitFeedback'
      );
      this.doneTasks = tasks.filter((task) => task.status === 'done');

      console.log('Todo Tasks:', this.todoTasks);
      console.log('In Progress Tasks:', this.inProgressTasks);
      console.log('Await Feedback Tasks:', this.awaitFeedbackTasks);
      console.log('Done Tasks:', this.doneTasks);
    });
  }

  constructor(private databaseService: DatabaseService) {}

  getPriorityIcon(priority: string): string {
    return (
      this.priorityIcons[priority as 'urgent' | 'medium' | 'low'] ||
      '/assets/img/icons/task_prio_default.png'
    );
  }

  handleShowAddTaskOverlay(status: string) {
    this.showAddTaskOverlay = true;
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
  }

  onDrop(event: DragEvent, status: string) {
    event.preventDefault();

    console.log('Dropped status:', status);
    this.databaseService
      .updateTask(this.daggedTaskId, {
        status: status,
      })
      .subscribe((updatedTask) => {
        console.log('Task updated:', updatedTask);
      });
    this.databaseService.loadTasks();
  }

  onDragOver(event: any, status: string) {
    event.preventDefault();
    console.log('onDragOver', status);
  }
}
