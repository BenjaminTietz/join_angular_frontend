import { HttpInterceptorFn } from "@angular/common/http";
import { HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Adds Authorization header with the token to the request if the token is available.
 * First looks in local storage and then in session storage.
 * @param req The request being sent.
 * @param next The next interceptor in the chain.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const clonedRequest = token
    ? req.clone({
        headers: req.headers.set("Authorization", `token ${token}`),
      })
    : req;
  return next(clonedRequest);
};
