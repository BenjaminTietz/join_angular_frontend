import { Component, HostListener, inject, Input } from "@angular/core";
import { RouterOutlet } from "@angular/router";
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
export class AppComponent {
  message = "";
  @Input() dialogOpen: boolean;
  @Input() isLoading: boolean;
  title = "Join Angular";
  communicationService = inject(CommunicationService);
  constructor() {
    this.dialogOpen = false;
    this.isLoading = true;
  }
  @HostListener("window:resize", ["$event"])

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
   * Listens for the window resize event and calls checkViewport() if the event is fired.
   * @param event The window resize event.
   */

  onResize(event: any) {
    this.checkViewport();
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
