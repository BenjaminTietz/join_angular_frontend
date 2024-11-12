import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  constructor(private router: Router, public authService: AuthService) {
    if (
      (this.router.url === "/imprint" ||
        this.router.url === "/privacy-policy") &&
      this.authService.currentUser === null
    ) {
      this.isLoggedIn = false;
    }
  }
  isUserMenuVisible = false;
  isLoggedIn: boolean = true;

  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
  }

  handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}
