import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommunicationService } from "../../services/communication.service";
import { Contact } from "../../models/contact.class";
@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  public communicationService = inject(CommunicationService);
  public authService = inject(AuthService);
  constructor(private router: Router) {
    if (
      this.router.url === "/imprint" ||
      this.router.url === "/privacy-policy"
    ) {
      this.isLoggedIn = false;
    }
  }
  isLoggedIn: boolean = true;
  contact: Contact | null = null;

  ngOnInit() {
    this.contact = this.authService.getContact();
  }

  toggleUserMenu(): void {
    this.communicationService.isUserMenuVisible =
      !this.communicationService.isUserMenuVisible;
  }

  closeMenu(): void {
    this.communicationService.isUserMenuVisible = false;
  }
  handleLogout() {
    this.authService.logout();
  }
}
