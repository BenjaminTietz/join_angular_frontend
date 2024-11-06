import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SignupComponent {
  signupForm!: FormGroup;

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
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
        privacy: [false, Validators.requiredTrue],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (password && confirmPassword) {
      // Wenn eines der Felder nicht berührt wurde, wird kein Fehler gesetzt
      if (!password.touched || !confirmPassword.touched) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { passwordsMismatch: true };
      }
    }
    return null;
  }

  //todo :implement logic for signup & contact creation afterwards in backend
  async onSubmit() {
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      const { name, email, password } = this.signupForm.value;
      try {
        const response = await this.authService.signup(name, email, password);
        console.log("Signup successful:", response);
        // todo: show success message
        this.router.navigate(["/"]);
      } catch (error) {
        console.error("Signup failed:", error);
        // todo: implement error handling
      }
    } else {
      console.log("Invalid Form");
    }
  }
}
