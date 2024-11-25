import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { DatabaseService } from "./database.service";
import { Contact } from "../models/contact.class";

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
  ) {
    this.loadAuthState();
  }

  private saveLoginData(response: any, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", response.token);
    storage.setItem(
      "contact",
      JSON.stringify(new Contact(response.user.contact))
    );
    this.isLoggedIn = true;
  }

  private loadAuthState(): void {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const contact =
      localStorage.getItem("contact") || sessionStorage.getItem("contact");
    this.isLoggedIn = !!token && !!contact;
  }

  async login(
    email: string,
    password: string,
    remember: boolean
  ): Promise<any> {
    const body = { email, password, remember };
    try {
      const response = await lastValueFrom(
        this.http.post<any>(this.loginUrl, body)
      );
      console.log("Login Response:", response);
      if (response?.token) {
        this.saveLoginData(response, remember);
        console.log("Contact saved:", response.user.contact);

        await firstValueFrom(
          this.http.post(`${environment.baseRefUrl}/generate-demo-data/`, {})
        );
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
    phone: string
  ): Promise<void> {
    const body = { username, email, password, phone };
    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.signupUrl, body)
      );
      console.log("Signup Successful", response);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
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

      const token = loginResponse.token;
      return { token };
    } catch (error) {
      console.error("Error during guest login:", error);
      throw error;
    }
  }

  public getContact(): Contact | null {
    const contactData =
      localStorage.getItem("contact") || sessionStorage.getItem("contact");
    return contactData ? new Contact(JSON.parse(contactData)) : null;
  }

  public logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("contact");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("contact");
    this.isLoggedIn = false;
    this.router.navigate(["/login"]);
  }

  public initializeAppData(): void {
    if (this.isLoggedIn) {
      this.databaseService.initializeData();
    }
  }

  public async requestPasswordReset(email: string): Promise<void> {
    const resetUrl = `${environment.baseRefUrl}/auth/password-reset/`;
    try {
      const response = await firstValueFrom(
        this.http.post(resetUrl, { email })
      );
      console.log("Password reset email sent:", response);
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    const resetUrl = `${environment.baseRefUrl}/auth/password-reset/${token}/`;
    try {
      const response = await firstValueFrom(
        this.http.post(resetUrl, { password })
      );
      console.log("Password reset successful:", response);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  }
}
