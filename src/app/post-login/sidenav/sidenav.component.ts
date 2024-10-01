import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  isLoggedIn: boolean = true;
  constructor(private router: Router, private authService: AuthService) {
    if (
      (this.router.url === '/imprint' ||
        this.router.url === '/privacy-policy') &&
      this.authService.currentUser === null
    ) {
      this.isLoggedIn = false;
    }
  }
}
