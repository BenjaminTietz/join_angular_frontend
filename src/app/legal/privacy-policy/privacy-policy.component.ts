import { Component, inject } from "@angular/core";
import { HeaderComponent } from "../../post-login/header/header.component";
import { SidenavComponent } from "../../post-login/sidenav/sidenav.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { CommunicationService } from "../../services/communication.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-privacy-policy",
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, CommonModule],
  templateUrl: "./privacy-policy.component.html",
  styleUrl: "./privacy-policy.component.scss",
})
export class PrivacyPolicyComponent {
  communicationService = inject(CommunicationService);
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Handles the closing of the privacy policy page by navigating to either /summary (if the user is logged in) or /login (if the user is not logged in).
   */
  handleClosePrivacyPolicy() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/summary"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
