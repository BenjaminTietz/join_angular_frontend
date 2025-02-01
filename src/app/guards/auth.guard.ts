import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  /**
   * Determines if the route can be activated based on authentication status.
   *
   * Checks if the current URL is part of the public routes or if there is a valid token
   * in localStorage or sessionStorage. If either condition is met, the function returns true,
   * allowing route activation. Otherwise, it redirects the user to the login page and returns false.
   *
   * @param route - The activated route snapshot.
   * @param state - The router state snapshot containing the target URL.
   * @returns A boolean indicating whether the route can be activated.
   */

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const publicRoutes = [
      "/reset-password",
      "/forgot-password",
      "/signup",
      "/imprint",
      "/privacy-policy",
      "/login",
      "/",
    ];

    const cleanedUrl = state.url.replace(/\/$/, "");

    if (publicRoutes.some((route) => cleanedUrl.startsWith(route))) {
      return true;
    }

    if (token) {
      return true;
    }
    this.router.navigate(["/login"], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
