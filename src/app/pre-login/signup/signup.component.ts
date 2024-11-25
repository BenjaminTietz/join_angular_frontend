import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { AppComponent } from "../../app.component";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SignupComponent {
  signupForm!: FormGroup;
  signupComplete = false;
  signupError = false;
  app = inject(AppComponent);
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
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

  /**
   * Custom validator to check if the values of the 'password' and 'confirmPassword' controls match.
   * Returns {passwordsMismatch: true} if they don't match, or null otherwise.
   * The validator only runs if both controls have been touched.
   */
  passwordsMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");
    if (password && confirmPassword) {
      if (!password.touched || !confirmPassword.touched) {
        return null;
      }
      if (password.value !== confirmPassword.value) {
        return { passwordsMismatch: true };
      }
    }
    return null;
  }

  strongPasswordValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.value;

    if (!password) {
      return null;
    }

    const errors: { [key: string]: boolean } = {};

    if (password.length < 8) {
      errors["minLength"] = true;
    }

    if (/^\d+$/.test(password)) {
      errors["numericOnly"] = true;
    }

    const commonPasswords = [
      "12345678",
      "password",
      "123456789",
      "qwerty",
      "123456",
      "abc123",
      "password1",
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors["tooCommon"] = true;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      errors["weak"] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  //todo :implement logic for signup & contact creation afterwards in backend
  // todo: send mail with activation link and after that set account_active to true
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
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 1500);
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
