import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-homescreen',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet],
  templateUrl: './homescreen.component.html',
  styleUrl: './homescreen.component.scss',
})
export class HomescreenComponent {}
