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
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.tasks$ = this.databaseService.getTasks();
  }

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
}
