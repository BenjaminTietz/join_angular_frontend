import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../models/task.class';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  priorityIcons: { [key in 'HIGH' | 'MEDIUM' | 'LOW']: string } = {
    HIGH: '/assets/img/icons/task_prio_urgent.png',
    MEDIUM: '/assets/img/icons/task_prio_medium.png',
    LOW: '/assets/img/icons/task_prio_low.png',
  };
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.tasks$ = this.databaseService.getTasks();
  }

  getPriorityIcon(priority: string): string {
    return (
      this.priorityIcons[priority as 'HIGH' | 'MEDIUM' | 'LOW'] ||
      '/assets/img/icons/task_prio_default.png'
    );
  }
}
