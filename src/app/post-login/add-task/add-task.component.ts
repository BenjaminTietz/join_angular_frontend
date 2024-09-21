import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Contact } from '../../models/contact.class';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../models/task.class';

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
  selectedPriority: string = '';
  @Input() category: string = '';

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) {
    this.addTaskForm = this.fb.group({
      taskTitle: ['', Validators.required],
      taskDescription: [''],
      taskDueDate: ['', Validators.required],
      taskPriority: ['', Validators.required],
      taskAssignedTo: this.fb.array([], Validators.required),
      category: ['', Validators.required],
      subtask: [''],
    });
  }

  ngOnInit(): void {
    this.contacts$ = this.databaseService.getContacts();
  }

  onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask: Task = {
        id: '',
        title: this.addTaskForm.value.taskTitle,
        description: this.addTaskForm.value.taskDescription,
        dueDate: this.addTaskForm.value.taskDueDate,
        assignedTo: this.addTaskForm.value.taskAssignedTo,
        category: this.addTaskForm.value.category,
        priority: this.addTaskForm.value.taskPriority,
        status: this.category || 'todo',
        subTasks: this.addTaskForm.value,
        createdAt: new Date().toISOString(),
        createdBy: '',
      };
      console.log('New Task:', newTask);
      this.databaseService.createTask(newTask).subscribe((task) => {
        console.log('Task created:', task);
        // todo : show "task added to board" message
      });
    }
  }
  onClear() {
    this.addTaskForm.reset();
  }

  onCheckboxChange(event: any) {
    const taskAssignedTo: FormArray = this.addTaskForm.get(
      'taskAssignedTo'
    ) as FormArray;

    if (event.target.checked) {
      taskAssignedTo.push(new FormControl(event.target.value));
    } else {
      const index = taskAssignedTo.controls.findIndex(
        (x) => x.value === event.target.value
      );
      taskAssignedTo.removeAt(index);
    }
  }
  setPriority(priority: string) {
    this.addTaskForm.patchValue({ taskPriority: priority });
    this.selectedPriority = priority;
  }
}
