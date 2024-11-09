import { Component } from "@angular/core";
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { CommunicationService } from "../../services/communication.service";
@Component({
  selector: "app-login",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm!: FormGroup;
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
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      remember: [false],
    });
  }
  // todo implement sending value of remember to backend, save in sesseion when false save in session / local storage
  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        const response = await this.authService.login(email, password);
        console.log("Login successful:", response);
        // todo: show success message
        this.router.navigate(["/summary"]);
      } catch (error) {
        console.error("Login failed:", error);
        // todo: implement error handling
      }
    } else {
      console.log("Invalid Form");
    }
  }

  handleGuestLogin() {
    this.authService.loginAsGuest();
  }
}
