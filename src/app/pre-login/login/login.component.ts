import { Component, inject, OnInit, Output, EventEmitter } from "@angular/core";
import { filter } from "rxjs/operators";
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { DatabaseService } from "../../services/database.service";
import { CommunicationService } from "../../services/communication.service";
import { FooterComponent } from "../shared/footer/footer.component";
import { HeaderComponent } from "../shared/header/header.component";
import { AppComponent } from "../../app.component";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    CommonModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  animations: [
    trigger("logoAnimationContainer", [
      state(
        "visible",
        style({
          opacity: 1,
          display: "block",
          backgroundColor: "white",
        })
      ),
      state(
        "hidden",
        style({
          opacity: 0,
          display: "none",
          backgroundColor: "transparent",
        })
      ),
      transition("visible => hidden", [animate("0.5s ease-out")]),
    ]),
    trigger("logoAnimation", [
      state(
        "center",
        style({
          transform: "translate(-50%, -50%) scale(1.5)",
          top: "50%",
          left: "50%",
          opacity: 1,
        })
      ),
      state(
        "header",
        style({
          transform: "translate(0, 0) scale(1)",
          top: "-10px",
          left: "10px",
          opacity: 1,
        })
      ),
      transition("center => header", [animate("1s ease-in-out")]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  @Output() animationFinished = new EventEmitter<void>();
  animationState: "center" | "header" | "hidden" = "center";
  containerState: "visible" | "hidden" = "visible";
  loginForm!: FormGroup;
  private destroy$ = new EventEmitter<void>();
  injectAuthService!: AuthService;
  app = inject(AppComponent);
  public communicationService = inject(CommunicationService);
  private databaseService = inject(DatabaseService);
  public authService = inject(AuthService);
  private router = inject(Router);
  constructor(private fb: FormBuilder) {
    this.createLoginForm();
  }

  /**
   * Called when the component is initialized.
   *
   * Checks if the user is already logged in, and if so, navigates to the summary page.
   * Listens for navigation end events and resets the animation state if the user navigates to the /login page.
   * Resets the animation state and starts the animation.
   */
  ngOnInit() {
    this.checkToken();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === "/login") {
          this.resetAnimationState();
          this.startAnimation();
        }
      });
    this.resetAnimationState();
    this.startAnimation();
  }

  /**
   * Called when the component is destroyed.
   *
   * Emits the `destroy$` event and completes it. Resets the animation state.
   * This is done to prevent memory leaks, and to ensure that the animation is reset
   * when the component is destroyed.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAnimationState();
  }

  /**
   * Checks if the user has a valid token.
   *
   * If the user has a valid token, navigates to the summary page.
   * If the token is invalid, logs out the user.
   * @returns A promise that resolves when the token has been checked.
   */
  async checkToken(): Promise<void> {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const isValid = await this.authService.validateToken(token);
        if (isValid) {
          this.router.navigate(["/summary"]);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        this.authService.logout();
      }
    }
  }

  /**
   * Starts the animation of the logo.
   *
   * Resets the animation state to its initial state, then waits for 1 second and sets the animation state to "header", and waits for another second and sets the container state to "hidden".
   * This creates a smooth animation of the logo moving from the center of the page to the top left corner, and then hiding the container.
   */
  private startAnimation() {
    this.resetAnimationState();
    setTimeout(() => {
      this.animationState = "header";
      setTimeout(() => {
        this.containerState = "hidden";
      }, 1000);
    }, 1000);
  }

  /**
   * Resets the animation state.
   *
   * Sets the animation state to "center" and the container state to "visible".
   * This prepares the component for a new animation sequence.
   */
  private resetAnimationState() {
    this.animationState = "center";
    this.containerState = "visible";
  }

  /**
   * Initializes the login form group.
   *
   * Creates a reactive form with three controls:
   * - `email`: a required field with email validation.
   * - `password`: a required field.
   * - `remember`: a boolean field to indicate if the user wants to be remembered, defaulting to false.
   */
  createLoginForm() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      remember: [false],
    });
  }

  /**
   * Handles form submission for login.
   *
   * Validates the login form and attempts to log in the user using the provided credentials.
   * If the login is successful and a token is received, the token is stored in either
   * local storage or session storage based on the 'remember' option.
   * Displays a success dialog and navigates to the summary page after a delay.
   * In case of an error during login, displays an error dialog.
   * Logs a message if the form is invalid.
   */
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

  /**
   * Logs in as a guest user.
   *
   * Logs in a user with email "guest@guest.com" and password "0123456789bb".
   * Saves the token in either local storage or session storage based on the 'remember'
   * option.
   * Displays a success dialog and navigates to the summary page after a delay.
   * In case of an error during login, displays an error dialog.
   * Logs a message if the form is invalid.
   */
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
