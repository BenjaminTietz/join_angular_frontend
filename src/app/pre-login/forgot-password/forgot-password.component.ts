import { Component, inject } from "@angular/core";
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
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { AppComponent } from "../../app.component";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "./forgot-password.component.scss",
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  injectAuthService!: AuthService;
  showForgottPasswordForm: boolean = true;
  app = inject(AppComponent);
  public communicationService = inject(CommunicationService);
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  constructor(private fb: FormBuilder) {
    this.createForgottPasswordForm();
  }

  createForgottPasswordForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }
  // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      try {
        await this.authService.requestPasswordReset(email);
        this.app.showDialog("Please check your email for reset instructions.");
        this.showForgottPasswordForm = false;
      } catch (error) {
        console.error("Error during password reset request:", error);
        this.app.showDialog("Failed to send reset email. Please try again.");
      }
    } else {
      console.error("Invalid form input");
    }
  }
}
