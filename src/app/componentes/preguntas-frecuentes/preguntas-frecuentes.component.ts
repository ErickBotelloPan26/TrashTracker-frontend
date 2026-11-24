import { MatExpansionModule } from "@angular/material/expansion";
import { Component } from "@angular/core";
@Component({
  selector: "app-preguntas-frecuentes",
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: "./preguntas-frecuentes.component.html",
  styleUrl: "./preguntas-frecuentes.component.css",
})
export class PreguntasFrecuentesComponent {}
