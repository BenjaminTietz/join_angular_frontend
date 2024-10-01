import { Component } from '@angular/core';
import { HeaderComponent } from '../../post-login/header/header.component';
import { SidenavComponent } from '../../post-login/sidenav/sidenav.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent {}
