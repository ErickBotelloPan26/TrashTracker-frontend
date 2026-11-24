import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-acceso-denegado",
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: "./acceso-denegado.component.html",
  styleUrl: "./acceso-denegado.component.css",
})
export class AccesoDenegadoComponent {}
