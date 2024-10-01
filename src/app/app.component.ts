import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './post-login/header/header.component';
import { SidenavComponent } from './post-login/sidenav/sidenav.component';
import { LoginComponent } from './pre-login/login/login.component';
import { SignupComponent } from './pre-login/signup/signup.component';
import { ImprintComponent } from './legal/imprint/imprint.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { SummaryComponent } from './post-login/summary/summary.component';
import { AddTaskComponent } from './post-login/add-task/add-task.component';
import { BoardComponent } from './post-login/board/board.component';
import { ContactsComponent } from './post-login/contacts/contacts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidenavComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    ImprintComponent,
    PrivacyPolicyComponent,
    SummaryComponent,
    AddTaskComponent,
    BoardComponent,
    ContactsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'join_angular';
}
