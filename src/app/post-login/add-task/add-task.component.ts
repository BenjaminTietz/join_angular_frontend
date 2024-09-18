import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Contact } from '../../models/contact.class';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit {
  addTaskForm!: FormGroup;
  categories = [
    { value: 'marketing', label: 'Marketing', class: 'marketing' },
    { value: 'sales', label: 'Sales', class: 'sales' },
    { value: 'development', label: 'Development', class: 'development' },
    { value: 'accounting', label: 'Accounting', class: 'accounting' },
    { value: 'purchase', label: 'Purchase', class: 'purchase' },
  ];
  contacts$!: Observable<Contact[]>;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) {
    this.addTaskForm = this.fb.group({
      taskTitle: ['', Validators.required],
      taskDescription: [''],
      taskDueDate: ['', Validators.required],
      taskPriority: ['', Validators.required],
      taskAssignedTo: [''],
      category: ['', Validators.required],
      subtask: [''],
    });
  }

  ngOnInit(): void {
    this.contacts$ = this.databaseService.getContacts();
  }

  onSubmit() {
    if (this.addTaskForm.valid) {
      console.log(this.addTaskForm.value);
    }
  }
  onClear() {
    this.addTaskForm.reset();
  }
}
