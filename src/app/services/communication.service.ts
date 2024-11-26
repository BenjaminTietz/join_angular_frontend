import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CommunicationService {
  isMobileViewActive: boolean = false;
  isSmallScreenActive: boolean = false;
  isLoggedIn: boolean = false;
  private resetFormSubject = new Subject<void>();
  resetForm$ = this.resetFormSubject.asObservable();
  constructor() {}

  triggerResetForm(): void {
    this.resetFormSubject.next();
  }
}
