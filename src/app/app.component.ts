import {
  Component,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./post-login/header/header.component";
import { SidenavComponent } from "./post-login/sidenav/sidenav.component";
import { LoginComponent } from "./pre-login/login/login.component";
import { SignupComponent } from "./pre-login/signup/signup.component";
import { ImprintComponent } from "./legal/imprint/imprint.component";
import { PrivacyPolicyComponent } from "./legal/privacy-policy/privacy-policy.component";
import { SummaryComponent } from "./post-login/summary/summary.component";
import { AddTaskComponent } from "./post-login/add-task/add-task.component";
import { BoardComponent } from "./post-login/board/board.component";
import { ContactsComponent } from "./post-login/contacts/contacts.component";
import { CommunicationService } from "./services/communication.service";
import { AuthService } from "./services/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidenavComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    ImprintComponent,
    PrivacyPolicyComponent,
    SummaryComponent,
    AddTaskComponent,
    BoardComponent,
    ContactsComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {
  message = "";
  @Input() dialogOpen: boolean = false;
  @Input() isLoading: boolean = false;
  title = "Join Angular";
  communicationService = inject(CommunicationService);
  private tokenSubscription!: Subscription;
  constructor(private authService: AuthService, private router: Router) {}
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.checkViewport();
  }
  ngOnInit() {
    this.verifyUserToken();
    this.checkViewport();
  }

  verifyUserToken() {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      console.log("Token is valid");
      this.authService.isLoggedIn = true;
      this.communicationService.isLoggedIn = true;
      this.navigateTo("/summary");
    } else {
      console.log("Token is invalid");
      this.authService.isLoggedIn = false;
      this.communicationService.isLoggedIn = false;
      this.navigateTo("/login");
    }
  }

  private navigateTo(path: string) {
    if (this.router.url !== path) {
      this.router.navigate([path]);
    }
  }

  ngOnDestroy() {
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
  }
  /**
   * Shows a dialog with the given message for 1 second.
   * @param message The message to be shown in the dialog.
   */
  public showDialog(message: string) {
    this.message = message;
    this.dialogOpen = true;
    setTimeout(() => {
      this.dialogOpen = false;
    }, 1000);
  }

  /**
   * Checks the current viewport dimensions and sets the isMobileViewActive flag.
   */
  checkViewport() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    // Flag for mobile view (height greater than width)
    this.communicationService.isMobileViewActive = height > width;
    console.log("mobile view", this.communicationService.isMobileViewActive);
    // Flag for small screen (tablet view)
    const isTabletScreen = width < 1200;
    this.communicationService.isSmallScreenActive = isTabletScreen;
    console.log("small screen", this.communicationService.isSmallScreenActive);
  }
}
