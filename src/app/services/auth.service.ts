import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.baseRefUrl}/login/`;
  private signupUrl = `${environment.baseRefUrl}/signup/`;
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(this.loginUrl, body).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('Login Successful', response.token);
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
