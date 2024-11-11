import { Component, inject } from "@angular/core";
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
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { AppComponent } from "../../app.component";
@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm!: FormGroup;
  injectAuthService!: AuthService;
  app = inject(AppComponent);
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
  // todo implement checking value of username / password, create token, sending value of remember to backend, save in session when false save in session / local storage
  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        const response = await this.authService.login(email, password);
        console.log("Login successful:", response);
        this.authService.isLoggedIn = true;
        this.app.showDialog("Login Successful");
        setTimeout(() => {
          this.router.navigate(["/summary"]);
        }, 1500);
      } catch (error) {
        console.error("Login failed:", error);
        this.app.showDialog("Login failed");
      }
    } else {
      console.log("Invalid Form");
    }
  }

  handleGuestLogin() {
    this.authService.loginAsGuest();
  }
}
