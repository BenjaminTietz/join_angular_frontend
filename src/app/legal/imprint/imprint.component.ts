import { Component, inject } from "@angular/core";
import { HeaderComponent } from "../../post-login/header/header.component";
import { SidenavComponent } from "../../post-login/sidenav/sidenav.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { CommunicationService } from "../../services/communication.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-imprint",
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, CommonModule],
  templateUrl: "./imprint.component.html",
  styleUrl: "./imprint.component.scss",
})
export class ImprintComponent {
  communicationService = inject(CommunicationService);
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handles the closing of the imprint view. If the user is logged in, it navigates to the summary page.
   * Otherwise, it navigates to the login page.
   */
  handleCloseImprint() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/summary"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
