import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { User } from "../models/user.class";
import { Router } from "@angular/router";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  isLoggedIn: boolean = false;
  private loginUrl = `${environment.baseRefUrl}/auth/login/`;
  private signupUrl = `${environment.baseRefUrl}/auth/signup/`;
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
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        this.currentUser.set(response.user);
        //this.loadCurrentUser(); todo: refactor
        this.databaseService.loadContacts();
        this.databaseService.loadTasks();
      }
    } catch (error) {
      console.error("Login Error:", error);
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

  async loginAsGuest() {
    try {
      const loginResponse = await this.login("guest@guest.com", "0123456789");
      console.log("Guest Login Response:", loginResponse);
      this.isLoggedIn = true;

      const csrfResponse: any = await firstValueFrom(
        this.http.get(`${environment.baseRefUrl}/get-csrf-token/`)
      );
      const csrfToken = csrfResponse.csrfToken;
      // todo, replace with AuthInterceptor
      const headers = new HttpHeaders({
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      });
      await firstValueFrom(
        this.http.post(
          `${environment.baseRefUrl}/generate-demo-data/`,
          {},
          { headers }
        )
      );
      setTimeout(() => {
        this.router.navigate(["/summary"]);
      }, 1500);
    } catch (error) {
      console.error("Error during guest login:", error);
      this.isLoggedIn = false;
    }
  }

  private loadCurrentUser() {
    const user = localStorage.getItem("user");
    console.log("CurrentUser Object", user);
  }
}
