import { Component, OnInit, inject } from "@angular/core";
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
import { Contact } from "../../models/contact.class";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-summary",
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, SidenavComponent],
  templateUrl: "./summary.component.html",
  styleUrl: "./summary.component.scss",
  animations: [
    trigger("slideOut", [
      state("visible", style({ transform: "translateY(0)", opacity: 1 })),
      state("hidden", style({ transform: "translateY(-200%)", opacity: 0 })),
      transition("visible => hidden", [animate("1s ease")]),
    ]),
    trigger("slideUp", [
      state("hidden", style({ transform: "translateY(100%)", opacity: 0 })),
      state("visible", style({ transform: "translateY(0)", opacity: 1 })),
      transition("hidden => visible", [animate("1s ease")]),
    ]),
  ],
})
export class SummaryComponent implements OnInit {
  public tasks: Task[] = [];
  public filteredTasks: Task[] = [];
  public greetingMessage: string | undefined;
  showMobileGreeting = false;
  showSummary = true;
  private subscriptions: Subscription = new Subscription();
  contact: Contact | null = null;
  public databaseService = inject(DatabaseService);
  public authService = inject(AuthService);
  public communicationService = inject(CommunicationService);
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.databaseService.initializeData(true);
    this.greetingMessage = this.getGreetingMessage();
    this.contact = this.authService.getContact();
    if (this.communicationService.isMobileViewActive) {
      this.showSummary = false;
      this.showMobileGreeting = true;
      setTimeout(() => {
        this.showMobileGreeting = false;
        this.showSummary = true;
      }, 2000);
    } else {
      this.showMobileGreeting = false;
      this.showSummary = true;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
