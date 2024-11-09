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

  ngOnInit(): void {
    this.checkRoute();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkRoute();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRoute(): void {
    this.showLoginHeader = this.router.url === "/login";
    console.log("showLoginHeader", this.showLoginHeader);
  }
}
