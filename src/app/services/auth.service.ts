import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.baseRefUrl}/login/`;
  private signupUrl = `${environment.baseRefUrl}/signup/`;
  constructor(private http: HttpClient) {}
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
}
