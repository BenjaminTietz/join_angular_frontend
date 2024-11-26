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
