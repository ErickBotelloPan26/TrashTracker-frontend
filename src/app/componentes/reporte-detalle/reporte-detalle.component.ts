import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { toSignal } from "@angular/core/rxjs-interop";
import { MapaReporteComponent } from "../mapa-reporte/mapa-reporte.component";
import { EditorEstadoReporteComponent } from "../editor-estado-reporte/editor-estado-reporte.component";
import { STATE_LABELS } from "../../model/interfaces/application";
import { Component, computed, inject, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  ActivatedRoute,
} from "@angular/router";
import { DatePipe } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ApplicationService } from "../../services/application-service";
@Component({
  selector: "app-reporte-detalle",
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    RouterLink,
    DatePipe,
    MapaReporteComponent,
    EditorEstadoReporteComponent,
  ],
  templateUrl: "./reporte-detalle.component.html",
  styleUrl: "./reporte-detalle.component.css",
})
export class ReporteDetalleComponent {
  readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  readonly labels = STATE_LABELS;
  readonly failedPhotos = signal(new Set<string>());
  photoFailed(id: string): void {
    this.failedPhotos.update((ids) => new Set([...ids, id]));
  }
  private readonly routeData = toSignal(this.route.data, {
    initialValue: this.route.snapshot.data,
  });
  readonly administration = computed(
    () => !!this.routeData()["administration"],
  );
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly report = computed(() =>
    this.store.reports().find((r) => r.id === this.params().get("id")),
  );
  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly created = computed(() => this.query().has("creado"));
}
