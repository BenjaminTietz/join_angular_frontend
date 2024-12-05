import { Component } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { SidenavComponent } from "../sidenav/sidenav.component";

@Component({
  selector: "app-instructions",
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: "./instructions.component.html",
  styleUrl: "./instructions.component.scss",
})
export class InstructionsComponent {
  /**
   * Closes the help page by going back in the browser's history.
   * @returns {void}
   */
  handleCloseHelp() {
    window.history.back();
  }
}
