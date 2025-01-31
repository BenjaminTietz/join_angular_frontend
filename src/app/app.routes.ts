import { Routes } from "@angular/router";
import { LoginComponent } from "./pre-login/login/login.component";
import { SignupComponent } from "./pre-login/signup/signup.component";
import { SummaryComponent } from "./post-login/summary/summary.component";
import { AddTaskComponent } from "./post-login/add-task/add-task.component";
import { BoardComponent } from "./post-login/board/board.component";
import { ContactsComponent } from "./post-login/contacts/contacts.component";
import { ImprintComponent } from "./legal/imprint/imprint.component";
import { PrivacyPolicyComponent } from "./legal/privacy-policy/privacy-policy.component";
import { AuthGuard } from "./guards/auth.guard";
import { InstructionsComponent } from "./post-login/instructions/instructions.component";
import { ForgotPasswordComponent } from "./pre-login/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./pre-login/reset-password/reset-password.component";
export const routes: Routes = [
  // pre-login component routes
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "password-reset/:token",
    component: ResetPasswordComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },

  // post-login component routes
  {
    path: "summary",
    component: SummaryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "add-task",
    component: AddTaskComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "board",
    component: BoardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "contacts",
    component: ContactsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "instructions",
    component: InstructionsComponent,
    canActivate: [AuthGuard],
  },

  // public routes
  {
    path: "privacy-policy",
    component: PrivacyPolicyComponent,
  },
  {
    path: "imprint",
    component: ImprintComponent,
  },
];
