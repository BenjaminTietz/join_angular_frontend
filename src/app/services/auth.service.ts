import { Injectable, signal } from '@angular/core';
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
  ) {
    this.loadCurrentUser();
  }
  public currentUser = signal<{
    id: number;
    email: string;
    username: string;
    initials: string;
  } | null>(null);

  async login(email: string, password: string) {
    const body = { email, password };
    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.loginUrl, body)
      );
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.loadCurrentUser();
        this.databaseService.loadContacts();
        this.databaseService.loadTasks();
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  }

  async signup(username: string, email: string, password: string) {
    const body = { username, email, password };
    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.signupUrl, body)
      );
      console.log('Signup Successful', response);
    } catch (error) {
      console.error('Signup Error:', error);
    }
  }

  //temporary login as guest aslong as the backend is locally hosteted --> todo refactor befor projekt is live
  async loginAsGuest() {
    try {
      const signupResponse = await this.signup(
        'Max Mustermann',
        'guest@guest.com',
        '12345678'
      );
      console.log('Guest Signup Response:', signupResponse);
      const loginResponse = await this.login('guest@guest.com', '12345678');
      console.log('Guest Login Response:', loginResponse);
      this.databaseService.contactInit();
      this.databaseService.taskInit();
      setTimeout(() => {
        this.router.navigate(['/summary']);
      }, 1500);
    } catch (error) {
      console.error('Error during guest login:', error);
      const err = error as { status: number; error: { email: string[] } };
      if (
        err?.status === 400 &&
        err?.error?.email?.[0] === 'user with this email already exists.'
      ) {
        console.log('User already exists, logging in instead.');
        await this.login('guest@guest.com', '12345678');
        this.router.navigate(['/summary']);
      }
    }
  }

  private loadCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      const initials = this.generateInitials(parsedUser.username);

      this.currentUser.set({
        ...parsedUser,
        initials: initials,
      });
    }
    console.log('CurrentUser Object', this.currentUser());
  }

  private generateInitials(username: string): string {
    const names = username.split(' ');
    const initials = names.map((name) => name.charAt(0).toUpperCase()).join('');
    return initials;
  }
}
