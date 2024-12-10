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
  isUserMenuVisible: boolean = false;
  showAddTaskOverlay: boolean = false;
  constructor() {}

  /**
   * Triggers the reset of the form in the add task component
   */
  triggerResetForm(): void {
    this.resetFormSubject.next();
  }
}
