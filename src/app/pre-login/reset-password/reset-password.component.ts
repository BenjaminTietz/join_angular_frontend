import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { CommunicationService } from "../../services/communication.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
})
export class ResetPasswordComponent {
  resetPasswordForm!: FormGroup;
  injectAuthService!: AuthService;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private databaseService: DatabaseService,
    public communicationService: CommunicationService
  ) {
    this.createLoginForm();
  }

  createLoginForm() {
    this.resetPasswordForm = this.fb.group({
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required],
    });
  }
  // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
  async onSubmit() {
    if (this.resetPasswordForm.valid) {
      // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
      console.log(this.resetPasswordForm.value);
    }
  }
}
