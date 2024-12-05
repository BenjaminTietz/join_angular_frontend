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

  /**
   * Lifecycle hook: Called when the component is initialized.
   * Retrieves the contact data from the AuthService and assigns it to the component's contact property.
   */
  ngOnInit() {
    this.contact = this.authService.getContact();
  }

  /**
   * Toggles the visibility of the user menu.
   * When the user menu is visible, it will be hidden and vice versa.
   */
  toggleUserMenu(): void {
    this.communicationService.isUserMenuVisible =
      !this.communicationService.isUserMenuVisible;
  }

  /**
   * Hides the user menu by setting the CommunicationService's isUserMenuVisible flag to false.
   */
  closeMenu(): void {
    this.communicationService.isUserMenuVisible = false;
  }
  /**
   * Logs the user out by calling the AuthService's logout method.
   */
  handleLogout() {
    this.authService.logout();
  }
}
