import { Component } from "@angular/core";
import { EncabezadoComponent } from "../encabezado/encabezado.component";
import { PiePaginaComponent } from "../pie-pagina/pie-pagina.component";
import { PresentacionComponent } from "../presentacion/presentacion.component";
import { ProblemaComponent } from "../problema/problema.component";
import { FuncionamientoComponent } from "../funcionamiento/funcionamiento.component";
import { VideoComponent } from "../video/video.component";
import { RecompensasComponent } from "../recompensas/recompensas.component";
import { MapaImpactoComponent } from "../mapa-impacto/mapa-impacto.component";
import { PreguntasFrecuentesComponent } from "../preguntas-frecuentes/preguntas-frecuentes.component";
import { TestimoniosComponent } from "../testimonios/testimonios.component";
import { EquipoComponent } from "../equipo/equipo.component";
import { LlamadaAccionComponent } from "../llamada-accion/llamada-accion.component";
@Component({
  selector: "app-pagina-principal",
  standalone: true,
  imports: [
    EncabezadoComponent,
    PiePaginaComponent,
    PresentacionComponent,
    ProblemaComponent,
    FuncionamientoComponent,
    VideoComponent,
    RecompensasComponent,
    MapaImpactoComponent,
    PreguntasFrecuentesComponent,
    TestimoniosComponent,
    EquipoComponent,
    LlamadaAccionComponent,
  ],
  templateUrl: "./pagina-principal.component.html",
  styleUrl: "./pagina-principal.component.css",
})
export class PaginaPrincipalComponent {}
