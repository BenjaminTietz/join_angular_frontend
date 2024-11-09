import { Component } from "@angular/core";
import { CommunicationService } from "../../services/communication.service";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DatabaseService } from "../../services/database.service";
import { AuthService } from "../../services/auth.service";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "./forgot-password.component.scss",
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  injectAuthService!: AuthService;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private databaseService: DatabaseService,
    public communicationService: CommunicationService
  ) {
    this.createLoginForm();
  }

  createLoginForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }
  // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
      console.log(this.forgotPasswordForm.value);
    }
  }
}
