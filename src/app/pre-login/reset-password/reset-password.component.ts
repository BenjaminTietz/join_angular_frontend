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
  token: string | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private databaseService: DatabaseService,
    private router: Router,
    public communicationService: CommunicationService,
    private route: ActivatedRoute
  ) {
    this.createSetNewPasswordForm();
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get("token");
    console.log("Extracted token:", this.token);
  }

  createSetNewPasswordForm() {
    this.setNewPasswordForm = this.fb.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.strongPasswordValidator,
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  /**
   * Custom validator to check if the values of 'password' and 'confirmPassword' controls match.
   * Returns {passwordsMismatch: true} if they don't match, or null otherwise.
   */
  passwordsMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");
    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        return { passwordsMismatch: true };
      }
    }
    return null;
  }

  /**
   * Validator to enforce strong password rules.
   */
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
        console.error("Password reset failed:", error);
        this.app.showDialog("Password reset failed");
      }
    } else {
      console.log("Invalid form or missing token");
    }
  }
}
