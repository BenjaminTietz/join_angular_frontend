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

  get passwordControl(): AbstractControl {
    return this.signupForm.get("password")!;
  }

  get confirmPasswordControl(): AbstractControl {
    return this.signupForm.get("confirmPassword")!;
  }

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

  get confirmPasswordError(): string | null {
    return this.signupForm.hasError("passwordsMismatch") &&
      this.confirmPasswordControl.touched
      ? "Passwords do not match."
      : null;
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password")?.value;
    const confirmPassword = control.get("confirmPassword")?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

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

  async onSubmit() {
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      const { username, email, password, phone } = this.signupForm.value;
      try {
        const response = await this.authService.signup(
          username,
          email,
          password,
          phone
        );
        console.log("Signup successful:", response);
        this.signupComplete = true;
        this.app.showDialog("Signup Successful");
        this.showSignupForm = false;
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 3000);
      } catch (error) {
        this.app.showDialog("Signup failed");
        console.error("Signup failed:", error);
        this.signupError = true;
      }
    } else {
      console.log("Invalid Form");
    }
  }
}
