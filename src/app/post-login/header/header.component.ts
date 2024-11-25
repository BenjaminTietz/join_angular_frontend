import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Contact } from "../../models/contact.class";
@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router, public authService: AuthService) {
    if (
      this.router.url === "/imprint" ||
      this.router.url === "/privacy-policy"
    ) {
      this.isLoggedIn = false;
    }
  }
  isUserMenuVisible = false;
  isLoggedIn: boolean = true;
  contact: Contact | null = null;

  ngOnInit() {
    this.contact = this.authService.getContact();
    console.log(this.contact);
  }

  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
  }

  handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}
