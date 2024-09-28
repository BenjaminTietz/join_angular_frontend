import { Routes } from '@angular/router';
import { HomescreenComponent } from './post-login/homescreen/homescreen.component';
import { LoginComponent } from './pre-login/login/login.component';
import { SignupComponent } from './pre-login/signup/signup.component';
import { SummaryComponent } from './post-login/summary/summary.component';
import { AddTaskComponent } from './post-login/add-task/add-task.component';
import { BoardComponent } from './post-login/board/board.component';
import { ContactsComponent } from './post-login/contacts/contacts.component';
import { ImprintComponent } from './legal/imprint/imprint.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { authGuard } from './guards/auth.guard';
import { InstructionsComponent } from './post-login/instructions/instructions.component';
export const routes: Routes = [
  // pre-login component routes
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },

  // post-login component routes
  {
    path: 'home',
    component: HomescreenComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: SummaryComponent },
      { path: 'summary', component: SummaryComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: 'board', component: BoardComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'instructions', component: InstructionsComponent },
    ],
  },
  // public routes
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'imprint',
    component: ImprintComponent,
  },
];
