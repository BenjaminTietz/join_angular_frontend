import { Routes } from '@angular/router';
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
    path: 'summary',
    component: SummaryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'add-task',
    component: AddTaskComponent,
    canActivate: [authGuard],
  },
  {
    path: 'board',
    component: BoardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'contacts',
    component: ContactsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'instructions',
    component: InstructionsComponent,
    canActivate: [authGuard],
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
