import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom, lastValueFrom, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { User } from "../models/user.class";
import { Router } from "@angular/router";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  isLoggedIn: boolean = false;
  public loginUrl = `${environment.baseRefUrl}/auth/login/`;
  public signupUrl = `${environment.baseRefUrl}/auth/signup/`;
  public verifyTokenUrl = `${environment.baseRefUrl}/auth/verify-token/`;
  constructor(
    private http: HttpClient,
    private router: Router,
    private databaseService: DatabaseService
  ) {}
  public currentUser = signal<{
    id: number;
    email: string;
    username: string;
    initials: string;
    color: string;
    real_name: string;
  } | null>(null);
  //todo refactor backend endpoint / response
  async login(email: string, password: string, remember: boolean) {
    const body = { email, password, remember };
    try {
      const response = await lastValueFrom(
        this.http.post<any>(this.loginUrl, body)
      );
      if (response?.token) {
        this.currentUser.set(response.user);
        this.databaseService.loadContacts();
        this.databaseService.loadTasks();
      }
      return response;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  async signup(
    username: string,
    email: string,
    password: string,
    phone: string,
    real_name: string
  ) {
    const body = { username, email, password, phone, real_name };
    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.signupUrl, body)
      );
      console.log("Signup Successful", response);
    } catch (error) {
      console.error("Signup Error:", error);
    }
  }

  async loginAsGuest(): Promise<{ token: string }> {
    try {
      const loginResponse = await this.login(
        "guest@guest.com",
        "0123456789",
        true
      );
      console.log("Guest Login Response:", loginResponse);

      const csrfResponse: any = await firstValueFrom(
        this.http.get(`${environment.baseRefUrl}/get-csrf-token/`)
      );

      const token = loginResponse.token;
      return { token };
    } catch (error) {
      console.error("Error during guest login:", error);
      throw error;
    }
  }

  public loadCurrentUser() {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    console.log("CurrentUser Object", user);
  }

  public initializeAppData(): void {
    if (this.isLoggedIn) {
      this.databaseService.initializeData();
    }
  }
}
