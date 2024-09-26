import { Component } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup;
  injectAuthService!: AuthService;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            // todo: implement error handling
          },
        });
    } else {
      console.log('Invalid Form');
    }
  }

  handleGuestLogin() {
    this.authService.loginAsGuest();
  }
}
