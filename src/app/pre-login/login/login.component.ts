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
          top: "0px",
          left: "0px",
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

  ngOnInit() {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetAnimationState();
  }

  private startAnimation() {
    this.resetAnimationState();
    setTimeout(() => {
      this.animationState = "header";
      setTimeout(() => {
        this.containerState = "hidden";
      }, 1000);
    }, 1000);
  }

  private resetAnimationState() {
    this.animationState = "center";
    this.containerState = "visible";
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
