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

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const publicRoutes = ["/reset-password", "/forgot-password"];
    console.log("Current URL:", state.url);
    console.log("Token found:", !!token);
    console.log(
      "Is public route:",
      publicRoutes.includes(state.url.replace(/\/$/, ""))
    );

    if (publicRoutes.includes(state.url.replace(/\/$/, ""))) {
      return true;
    }

    if (token) {
      console.log("Token valid. Access granted.");
      return true;
    } else {
      console.log("No token found. Redirecting to login.");
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
}
