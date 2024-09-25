import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(private router: Router) {}
  isUserMenuVisible = false;
  toggleUserMenu() {
    this.isUserMenuVisible = !this.isUserMenuVisible;
  }

  handleLogout() {
    localStorage.clear();
    this.router.navigate(['']);
  }
}
