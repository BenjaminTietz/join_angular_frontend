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
  public loginUrl = `${environment.baseRefUrl}/login/`;
  public signupUrl = `${environment.baseRefUrl}/signup/`;
  public verifyTokenUrl = `${environment.baseRefUrl}/verify-token/`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private databaseService: DatabaseService
  ) {
    this.loadAuthState();
  }

  /**
   * Saves the login data to either localStorage or sessionStorage based on the user's preference.
   *
   * @param response - The response object containing user authentication details.
   * @param remember - A boolean flag indicating whether to remember the user across sessions.
   *
   * Stores the authentication token, user ID, and contact information in the chosen storage.
   * Sets the isLoggedIn flag to true upon successful storage of login data.
   */
  private saveLoginData(response: any, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", response.token);
    storage.setItem("userId", response.user.id.toString());
    storage.setItem(
      "contact",
      JSON.stringify(new Contact(response.user.contact))
    );
    this.isLoggedIn = true;
  }

  /**
   * Checks if the user is logged in by looking for a token and contact info in either
   * localStorage or sessionStorage. If both are present, sets the isLoggedIn flag to
   * true. Otherwise, sets it to false.
   */
  private loadAuthState(): void {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const contact =
      localStorage.getItem("contact") || sessionStorage.getItem("contact");
    this.isLoggedIn = !!token && !!contact;
  }

  /**
   * Validates the provided authentication token.
   *
   * Sends a POST request to the server to verify the validity of the token.
   * Logs the server response in case of a successful validation.
   * Returns `true` if the token is valid, otherwise returns `false`.
   *
   * @param token - The authentication token to validate.
   * @returns A promise that resolves to a boolean indicating the validity of the token.
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ message: string }>(this.verifyTokenUrl, { token })
      );
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }

  /**
   * Logs the user in and stores the authentication token and contact information
   * in either localStorage (if remember is true) or sessionStorage.
   *
   * Sends a POST request to the server with the user's email, password, and
   * remember flag. If the server responds with a token, the function saves the
   * token and contact information in either localStorage or sessionStorage
   * and returns the response.
   *
   * If the server does not respond with a token, the function throws an error.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param remember - A boolean indicating whether the user wants their login
   * credentials to be remembered.
   * @returns A promise that resolves to the server's response.
   */
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
      if (response?.token) {
        this.saveLoginData(response, remember);
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

  /**
   * Registers a new user by sending their details to the server.
   *
   * Sends a POST request with the user's username, email, password, and phone number
   * to the server's signup endpoint. If the server responds successfully, the user
   * is considered registered.
   *
   * Logs an error message if the signup process fails and propagates the error.
   *
   * @param username - The user's chosen username.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param phone - The user's phone number.
   * @returns A promise that resolves when the signup process is complete.
   * @throws An error if the signup process fails.
   */
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
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  }

  /**
   * Logs in as a guest user.
   *
   * Attempts to log in using predefined guest credentials ("guest@guest.com" and "0123456789").
   * If successful, the function returns an object containing the authentication token.
   * In case of an error during the login attempt, logs the error and rethrows it.
   *
   * @returns A promise that resolves to an object containing the guest user's authentication token.
   * @throws An error if the login attempt fails.
   */
  async loginAsGuest(): Promise<{ token: string }> {
    try {
      const loginResponse = await this.login(
        "guest@guest.com",
        "0123456789bb",
        true
      );
      const token = loginResponse.token;
      return { token };
    } catch (error) {
      console.error("Error during guest login:", error);
      throw error;
    }
  }

  /**
   * Retrieves the contact information from localStorage or sessionStorage.
   *
   * Looks for the stored contact information in localStorage first, then in sessionStorage.
   * If found, parses the contact data and returns it as a Contact object.
   * If no contact information is found, returns null.
   *
   * @returns A Contact object if contact data is found in storage, otherwise null.
   */
  public getContact(): Contact | null {
    const contactData =
      localStorage.getItem("contact") || sessionStorage.getItem("contact");
    return contactData ? new Contact(JSON.parse(contactData)) : null;
  }

  /**
   * Retrieves the user ID from localStorage or sessionStorage.
   *
   * Looks for the stored user ID in localStorage first, then in sessionStorage.
   * If found, parses the user ID and returns it as a number.
   * If no user ID is found, returns null.
   *
   * @returns A number representing the user ID if found in storage, otherwise null.
   */
  public getUserId(): number | null {
    const userId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Logs the user out of the application by removing the authentication token, contact information, and user ID from local and session storage, and navigating to the login page.
   */
  public logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("contact");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("contact");
    sessionStorage.removeItem("userId");
    this.isLoggedIn = false;
    this.router.navigate(["/"]);
  }

  /**
   * Initializes the application's data by calling the DatabaseService's initializeData method
   * if the user is already logged in.
   *
   * This method is called when the application is started and the user is already logged in.
   * It ensures that the application's data is initialized before the user interacts with the application.
   */
  public initializeAppData(): void {
    if (this.isLoggedIn) {
      this.databaseService.initializeData();
    }
  }

  /**
   * Requests a password reset email from the server for the given email address.
   *
   * The server will send an email with a link to reset the password. The link will contain a token
   * that can be used to reset the password in the ResetPasswordComponent.
   *
   * If the request fails, the method will throw the error.
   * @param email The email address for which to request a password reset.
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const resetUrl = `${environment.baseRefUrl}/password-reset/`;
    try {
      const response = await firstValueFrom(
        this.http.post(resetUrl, { email })
      );
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  /**
   * Resets the user's password to the given password for the given token.
   *
   * The token is the one sent to the user by email in response to a password reset request.
   * The password is the new password to be set for the user.
   *
   * If the request fails, the method will throw the error.
   * @param token The token sent to the user by email to reset their password.
   * @param password The new password to be set for the user.
   */
  public async resetPassword(token: string, password: string): Promise<void> {
    const resetUrl = `${environment.baseRefUrl}/password-reset/${token}/`;
    try {
      const response = await firstValueFrom(
        this.http.post(resetUrl, { password })
      );
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  }
}
