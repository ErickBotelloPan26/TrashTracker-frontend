import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { afterNextRender } from "@angular/core";
import { MapaReporteComponent } from "../mapa-reporte/mapa-reporte.component";
import { GeolocationService } from "../../services/geolocation.service";
import {
  Coordinates,
  STATE_LABELS,
  WASTE_TYPES,
} from "../../model/interfaces/application";
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
  selector: "app-mapa-comunitario",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    RouterLink,
    DatePipe,
    MapaReporteComponent,
  ],
  templateUrl: "./mapa-comunitario.component.html",
  styleUrl: "./mapa-comunitario.component.css",
})
export class MapaComunitarioComponent {
  readonly store = inject(ApplicationService);
  private readonly router = inject(Router);
  private readonly geo = inject(GeolocationService);
  readonly query = signal("");
  readonly waste = signal("");
  readonly state = signal("");
  readonly center = signal<Coordinates | null>(null);
  readonly message = signal("");
  readonly locating = signal(false);
  get wasteTypes(): string[] {
    return this.store.wasteTypes().map((t) => t.nombre);
  }
  readonly labels = STATE_LABELS;
  readonly filtered = computed(() =>
    this.store
      .reports()
      .filter(
        (r) =>
          (!this.waste() || r.waste === this.waste()) &&
          (!this.state() || r.state === this.state()) &&
          (!this.query().trim() ||
            this.normalize(
              r.address + " " + r.description + " " + r.title,
            ).includes(this.normalize(this.query()))),
      ),
  );
  constructor() {
    this.store.usuario.getLocation(this.store.profile().id).subscribe({
      next: (p) => this.center.set([Number(p.latitud), Number(p.longitud)]),
      error: (e) => {
        if (e.status !== 404)
          this.message.set("No se pudo recuperar tu ubicación guardada.");
      },
    });
    afterNextRender(() => {
      void this.locateIfGranted();
    });
  }
  private normalize(s: string): string {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
  search(): void {
    const row = this.filtered()[0];
    if (row) {
      this.center.set([...row.coordinates]);
      this.message.set("Mostrando " + this.filtered().length + " reporte(s).");
    } else this.message.set("No hay reportes con esos filtros.");
  }
  async locate(): Promise<void> {
    this.locating.set(true);
    try {
      const position = await this.geo.current();
      this.center.set(position);
      this.store.usuario
        .location(this.store.profile().id, position[0], position[1])
        .subscribe({
          error: () =>
            this.message.set(
              "Mapa centrado. No se pudo guardar tu ubicación en el servidor.",
            ),
        });
      this.message.set("Mapa centrado en tu ubicación.");
    } catch (error) {
      this.message.set((error as Error).message);
    } finally {
      this.locating.set(false);
    }
  }
  open(id: string): void {
    void this.router.navigate(["/app/reportes", id]);
  }

  private async locateIfGranted(): Promise<void> {
    try {
      if (
        navigator.permissions &&
        (await navigator.permissions.query({ name: "geolocation" })).state ===
          "granted"
      )
        await this.locate();
    } catch {
      /* El botón permite solicitar ubicación si el navegador no expone Permissions API. */
    }
  }
}
