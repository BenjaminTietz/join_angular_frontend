import { Component } from "@angular/core";
import { HeaderComponent } from "../../post-login/header/header.component";
import { SidenavComponent } from "../../post-login/sidenav/sidenav.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-privacy-policy",
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: "./privacy-policy.component.html",
  styleUrl: "./privacy-policy.component.scss",
})
export class PrivacyPolicyComponent {
  constructor(private authService: AuthService, private router: Router) {}

  handleClosePrivacyPolicy() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/summary"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
