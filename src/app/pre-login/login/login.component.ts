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
  public communicationService = inject(CommunicationService);
  private databaseService = inject(DatabaseService);
  public authService = inject(AuthService);
  private router = inject(Router);
  constructor(private fb: FormBuilder) {
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
      this.app.isLoading = true;
      try {
        const { email, password, remember } = this.loginForm.value;
        const response = await this.authService.login(
          email,
          password,
          remember
        );
        this.authService.isLoggedIn = true;
        if (response?.token) {
          if (remember) {
            localStorage.setItem("token", response.token);
          } else {
            sessionStorage.setItem("token", response.token);
          }
        }

        this.app.showDialog("Login Successful");
        setTimeout(() => {
          this.databaseService.initializeData();
          this.app.isLoading = false;
          this.router.navigate(["/summary"]);
        }, 3000);
      } catch (error) {
        console.error("Login failed:", error);
        this.app.showDialog("Login failed");
        this.app.isLoading = false;
      }
    } else {
      console.log("Invalid Form");
    }
  }
  async loginAsGuest() {
    this.app.isLoading = true;
    try {
      const email = "guest@guest.com";
      const password = "0123456789bb";
      const remember = true;
      const response = await this.authService.login(email, password, remember);
      if (response?.token) {
        this.authService.isLoggedIn = true;
        if (remember) {
          localStorage.setItem("token", response.token);
        } else {
          sessionStorage.setItem("token", response.token);
        }
      }
      this.app.showDialog("Login Successful");
      setTimeout(() => {
        this.app.isLoading = false;
        this.router.navigate(["/summary"]);
      }, 2000);
      this.databaseService.initializeData();
    } catch (error) {
      console.error("Login failed:", error);
      this.app.showDialog("Login failed");
      this.app.isLoading = false;
    }
  }
}
