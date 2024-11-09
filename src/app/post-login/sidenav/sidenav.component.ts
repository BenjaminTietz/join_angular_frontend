import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-sidenav",
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: "./sidenav.component.html",
  styleUrl: "./sidenav.component.scss",
})
export class SidenavComponent {
  constructor(private router: Router, public authService: AuthService) {}
}
