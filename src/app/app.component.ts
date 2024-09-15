import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomescreenComponent } from './post-login/homescreen/homescreen.component';
import { HeaderComponent } from './post-login/header/header.component';
import { SidenavComponent } from './post-login/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HomescreenComponent,
    HeaderComponent,
    SidenavComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'join_angular';
}
