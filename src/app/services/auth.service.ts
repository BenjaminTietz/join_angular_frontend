import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.class';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.baseRefUrl}/login/`;
  private signupUrl = `${environment.baseRefUrl}/signup/`;
  constructor(
    private http: HttpClient,
    private router: Router,
    private databaseService: DatabaseService
  ) {}
  public currentUser: any | null = null;

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(this.loginUrl, body).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', response.user);
          this.currentUser = response.user;
          console.log('Login Successful', response.token);
          console.log('Login Successful', response);
          console.log('CurrentUser Object', this.currentUser);
        }
      })
    );
  }
  signup(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post<any>(this.signupUrl, body).pipe(
      tap((response) => {
        console.log('Signup Successful', response);
      })
    );
  }

  //temporary login as guest aslong as the backend is locally hosteted --> todo refactor befor projekt is live
  public async loginAsGuest() {
    try {
      const signupResponse = await firstValueFrom(
        this.signup('Max Mustermann', 'guest@guest.com', '12345678')
      );
      console.log('Guest Signup Response:', signupResponse);

      const loginResponse = await firstValueFrom(
        this.login('guest@guest.com', '12345678')
      );
      console.log('Guest Login Response:', loginResponse);
      this.databaseService.contactInit();
      this.databaseService.taskInit();
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } catch (error) {
      console.error('Error during guest login:', error);

      if (
        (error as any).status === 400 &&
        (error as any).error?.email?.[0] ===
          'user with this email already exists.'
      ) {
        console.log('User already exists, logging in instead.');

        try {
          const loginResponse = await firstValueFrom(
            this.login('guest@guest.com', '12345678')
          );
          console.log('Guest Login Response:', loginResponse);
          this.router.navigate(['/home']);
        } catch (loginError) {
          console.error('Error during guest login attempt:', loginError);
        }
      }
    }
  }
}
