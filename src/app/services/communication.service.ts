import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CommunicationService {
  isMobileViewActive: boolean = false;
  isSmallScreenActive: boolean = false;

  constructor() {}
}
