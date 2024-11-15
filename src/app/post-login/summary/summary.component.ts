import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { DatabaseService } from "../../services/database.service";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";
import { Subscription } from "rxjs";
import { AppComponent } from "../../app.component";
import { CommunicationService } from "../../services/communication.service";
import { Task } from "../../models/task.class";
@Component({
  selector: "app-summary",
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, SidenavComponent],
  templateUrl: "./summary.component.html",
  styleUrl: "./summary.component.scss",
})
export class SummaryComponent implements OnInit {
  public tasks: Task[] = [];
  public filteredTasks: Task[] = [];
  public greetingMessage: string | undefined;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private router: Router,
    public databaseService: DatabaseService,
    private http: HttpClient,
    public authService: AuthService,
    public communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.databaseService.initializeData(true);
    this.greetingMessage = this.getGreetingMessage();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    console.log("SummaryComponent destroyed and subscriptions unsubscribed.");
  }

  //Helper function to show greeting message based on time

  public getGreetingMessage(): string {
    const date = new Date();
    const hours = date.getHours();
    if (hours < 12) {
      return "Good Morning, ";
    } else if (hours < 17) {
      return "Good Afternoon, ";
    } else {
      return "Good Evening, ";
    }
  }
}
