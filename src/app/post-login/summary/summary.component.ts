import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  public tasks: any[] = [];
  public contacts: any[] = [];
  constructor(
    private router: Router,
    private databaseService: DatabaseService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.databaseService.getTasks().subscribe((tasks) => {
      console.log(tasks);
    });
    this.databaseService.getContacts().subscribe((contacts) => {
      console.log(contacts);
    });
  }
}
