import { Component, OnInit } from "@angular/core";
import { CommunicationService } from "../../../services/communication.service";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit {
  showLoginHeader = false;
  constructor(
    public communicationService: CommunicationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLoginHeader = event.urlAfterRedirects === "/";
      });
  }
}
