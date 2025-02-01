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
            this.strongPasswordValidator,
          ],
        ],
        confirmPassword: ["", Validators.required],
        privacy: [false, Validators.requiredTrue],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  /**
   * Retrieves the AbstractControl for the password form control.
   *
   * @returns AbstractControl for the password field in the signup form.
   */

  get passwordControl(): AbstractControl {
    return this.signupForm.get("password")!;
  }

  /**
   * Returns the AbstractControl for the confirmPassword form control.
   * @returns AbstractControl
   */
  get confirmPasswordControl(): AbstractControl {
    return this.signupForm.get("confirmPassword")!;
  }

  /**
   * Returns a string error message if the password control has errors.
   * Otherwise, returns null.
   * @returns string | null
   */
  get passwordErrors(): string | null {
    if (!this.passwordControl.touched || !this.passwordControl.errors)
      return null;
    const errors = this.passwordControl.errors;
    if (errors["required"]) return "The password is required.";
    if (errors["minlength"])
      return "The password must be at least 8 characters long.";
    if (errors["numericOnly"])
      return "The password must not be entirely numeric.";
    if (errors["tooCommon"])
      return "The password is too common. Please choose a stronger one.";
    if (errors["weak"])
      return "The password must contain at least one letter and one number.";
    return null;
  }

  /**
   * A convenience property that returns an error message if the passwords do not match, or null if they do.
   * The error message is only returned if the confirmPasswordControl has been touched.
   * @returns A string error message if the passwords do not match, or null if they do.
   */
  get confirmPasswordError(): string | null {
    return this.signupForm.hasError("passwordsMismatch") &&
      this.confirmPasswordControl.touched
      ? "Passwords do not match."
      : null;
  }

  /**
   * Custom validator to check if the values of 'password' and 'confirmPassword' controls match.
   * Returns {passwordsMismatch: true} if they don't match, or null otherwise.
   * @param control - The control containing the 'password' and 'confirmPassword' inputs.
   * @returns A ValidationErrors object if the passwords do not match, or null if they do.
   */
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password")?.value;
    const confirmPassword = control.get("confirmPassword")?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

  /**
   * Custom validator to check the strength of a password.
   *
   * Validates the following password criteria:
   * - Must be at least 8 characters long.
   * - Must not be entirely numeric.
   * - Must not be a commonly used password.
   * - Must contain at least one letter and one number.
   *
   * @param control - The form control containing the password value.
   * @returns A ValidationErrors object containing any validation errors,
   *          or null if the password is strong.
   */

  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;
    const errors: ValidationErrors = {};
    if (password.length < 8) errors["minlength"] = true;
    if (/^\d+$/.test(password)) errors["numericOnly"] = true;
    const commonPasswords = [
      "12345678",
      "password",
      "123456789",
      "qwerty",
      "123456",
      "abc123",
      "password1",
    ];
    if (commonPasswords.includes(password.toLowerCase()))
      errors["tooCommon"] = true;
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
      errors["weak"] = true;
    return Object.keys(errors).length > 0 ? errors : null;
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
