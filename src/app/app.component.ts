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
import { NavigationEnd } from "@angular/router";

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
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.verifyUserToken();
      }
    });
    this.checkViewport();
  }

  /**
   * Verifies if a user token is present in local or session storage and sets the
   * isLoggedIn flag accordingly. If the current route is a public route, this
   * function will not set the flag.
   */
  verifyUserToken() {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const publicRoutes = ["/reset-password", "/forgot-password"];
    const currentRoute = this.router.url.split("?")[0];
    const baseRoute = currentRoute.split("/")[1];
    if (publicRoutes.some((route) => currentRoute.startsWith(route))) {
      return;
    }
    if (token) {
      this.authService.isLoggedIn = true;
      this.communicationService.isLoggedIn = true;
    } else {
      this.authService.isLoggedIn = false;
      this.communicationService.isLoggedIn = false;
    }
  }

  /**
   * Lifecycle hook: Called when the component is destroyed.
   * Unsubscribes from the token subscription to prevent memory leaks.
   */
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
    // Flag for small screen (tablet view)
    const isTabletScreen = width < 1200;
    this.communicationService.isSmallScreenActive = isTabletScreen;
  }

  @HostListener("document:click", ["$event"])
  /**
   * Listens for clicks on the document and closes the user menu if the
   * target element is not part of the user menu or the user profile.
   * @param event The click event.
   */
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".user-menu") && !target.closest(".user-profile")) {
      this.communicationService.isUserMenuVisible = false;
    }
  }
}
