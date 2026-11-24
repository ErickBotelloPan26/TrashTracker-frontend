import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  selector: "app-encabezado",
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule, RouterLink],
  templateUrl: "./encabezado.component.html",
  styleUrl: "./encabezado.component.css",
})
export class EncabezadoComponent {
  readonly menuOpen = signal(false);
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
