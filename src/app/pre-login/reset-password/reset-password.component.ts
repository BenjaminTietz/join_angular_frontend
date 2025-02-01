import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { CommunicationService } from "../../services/communication.service";
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { AppComponent } from "../../app.component";
import { FormValidationService } from "../../services/form-validation.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
})
export class ResetPasswordComponent implements OnInit {
  setNewPasswordForm!: FormGroup;
  injectAuthService!: AuthService;
  setNewPassword: boolean = true;
  app = inject(AppComponent);
  public communicationService = inject(CommunicationService);
  private databaseService = inject(DatabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  validationService = inject(FormValidationService);
  token: string | null = null;
  constructor(private fb: FormBuilder) {
    this.createSetNewPasswordForm();
  }

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound
   * properties of a directive.
   *
   * Retrieves the token from the route parameter map and stores it in the
   * component's `token` property.
   */
  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get("token");
  }

  /**
   * Initializes the form group for setting a new password.
   *
   * This form group contains two controls:
   * - `password`: a required field with a minimum length of 8 characters
   *   and additional validation through the `strongPasswordValidator`.
   * - `confirmPassword`: a required field that must match the `password`
   *   field, validated by the `passwordsMatchValidator`.
   */

  createSetNewPasswordForm() {
    this.setNewPasswordForm = this.fb.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.validationService.strongPasswordValidator,
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.validationService.passwordsMatchValidator }
    );
  }

  /**
   * Returns an error message for password validation.
   *
   * The error message is either null (if the password is valid) or a string
   * describing the validation error.
   */
  get passwordErrors(): string | null {
    return this.validationService.getPasswordErrors(
      this.setNewPasswordForm.get("password")!
    );
  }

  /**
   * Returns an error message for confirming the password.
   *
   * The error message is either null (if the passwords match) or a string
   * describing the validation error.
   */
  get confirmPasswordError(): string | null {
    return this.validationService.getConfirmPasswordError(
      this.setNewPasswordForm
    );
  }

  /**
   * Handles the form submission for setting a new password.
   *
   * Validates the form and attempts to set a new password for the user
   * using the provided password and token. If the request is successful,
   * a dialog is shown to inform the user of the success and the form is
   * hidden. A timeout is set to navigate to the login page after 3 seconds.
   * If the request fails, an error dialog is displayed.
   * Logs an error message if the form input is invalid.
   */
  async onSubmit() {
    if (this.setNewPasswordForm.valid && this.token) {
      const { password } = this.setNewPasswordForm.value;
      try {
        await this.authService.resetPassword(this.token, password);
        this.app.showDialog("Password reset successful");
        this.setNewPassword = false;
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 3000);
      } catch (error) {
        this.app.showDialog("Password reset failed");
      }
    }
  }
}
