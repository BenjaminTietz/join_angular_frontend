import { HttpInterceptorFn } from "@angular/common/http";
import { HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  console.log("Interceptor", token);
  const clonedRequest = token
    ? req.clone({
        headers: req.headers.set("Authorization", `token ${token}`),
      })
    : req;
  console.log("Interceptor request", clonedRequest);
  return next(clonedRequest);
};
