import { Component, OnInit } from "@angular/core";
import { CommunicationService } from "../../../services/communication.service";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  showLoginHeader = false;
  private destroy$ = new Subject<void>();
  constructor(
    public communicationService: CommunicationService,
    public router: Router
  ) {}

  /**
   * Lifecycle hook: Called when the component is initialized.
   * Subscribes to router events to check the route and update the
   * showLoginHeader flag accordingly.
   */
  ngOnInit(): void {
    this.checkRoute();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkRoute();
    });
  }

  /**
   * Lifecycle hook: Called when the component is destroyed.
   * Emits the `destroy$` event and completes it. This is done to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Checks the current route and updates the showLoginHeader flag accordingly.
   * The showLoginHeader flag is set to true if the route is "/login" and false otherwise.
   */
  private checkRoute(): void {
    this.showLoginHeader = this.router.url === "/login";
  }
}
