import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { AppComponent } from "../../app.component";
import { CommonModule } from "@angular/common";
import { FormValidationService } from "../../services/form-validation.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FooterComponent,
    HeaderComponent,
    CommonModule,
  ],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SignupComponent {
  signupForm!: FormGroup;
  signupComplete = false;
  signupError = false;
  app = inject(AppComponent);
  router = inject(Router);
  authService = inject(AuthService);
  validationService = inject(FormValidationService);
  showSignupForm: boolean = true;
  constructor(private fb: FormBuilder) {
    this.createSignupForm();
  }

  /**
   * Initializes the signup form group with validators.
   *
   * Creates a reactive form with six controls:
   * - `username`: a required field.
   * - `email`: a required field with email validation.
   * - `phone`: a required field with a pattern validator allowing only digits.
   * - `password`: a required field with a minimum length of 8 characters and a custom strong password validator.
   * - `confirmPassword`: a required field for confirming the password.
   * - `privacy`: a required boolean field that must be true to proceed.
   *
   * The form also includes a custom validator to ensure the password and confirmPassword fields match.
   */

  createSignupForm() {
    this.signupForm = this.fb.group(
      {
        username: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.validationService.strongPasswordValidator,
          ],
        ],
        confirmPassword: ["", Validators.required],
        privacy: [false, Validators.requiredTrue],
      },
      { validators: this.validationService.passwordsMatchValidator }
    );
  }

  get passwordErrors(): string | null {
    return this.validationService.getPasswordErrors(
      this.signupForm.get("password")!
    );
  }

  get confirmPasswordError(): string | null {
    return this.validationService.getConfirmPasswordError(this.signupForm);
  }

  /**
   * Submits the signup form.
   *
   * Validates the signup form. If the form is valid, attempts to sign the user up.
   * If the signup is successful, the form is hidden and a success dialog is shown.
   * After a delay, the user is redirected to the home page. If the signup fails,
   * an error dialog is shown and the signup error flag is set.
   */
  async onSubmit() {
    if (this.signupForm.valid) {
      const { username, email, password, phone } = this.signupForm.value;
      try {
        const response = await this.authService.signup(
          username,
          email,
          password,
          phone
        );
        this.signupComplete = true;
        this.app.showDialog("Signup Successful");
        this.showSignupForm = false;
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 3000);
      } catch (error) {
        this.app.showDialog("Signup failed");
        this.signupError = true;
      }
    }
  }
}
