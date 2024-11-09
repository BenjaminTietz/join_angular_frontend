import { Component } from "@angular/core";
import { HeaderComponent } from "../../post-login/header/header.component";
import { SidenavComponent } from "../../post-login/sidenav/sidenav.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-imprint",
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: "./imprint.component.html",
  styleUrl: "./imprint.component.scss",
})
export class ImprintComponent {
  constructor(private authService: AuthService, private router: Router) {}

  handleCloseImprint() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(["/summary"]);
    } else {
      this.router.navigate(["/login"]);
    }
  }
}
