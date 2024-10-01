import { Component } from '@angular/core';
import { HeaderComponent } from '../../post-login/header/header.component';
import { SidenavComponent } from '../../post-login/sidenav/sidenav.component';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
})
export class ImprintComponent {}
