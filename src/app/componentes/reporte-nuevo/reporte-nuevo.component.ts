import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { Component, inject, signal, afterNextRender } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MapaReporteComponent } from "../mapa-reporte/mapa-reporte.component";
import { ApplicationService } from "../../services/application-service";
import { GeolocationService } from "../../services/geolocation.service";
import { Coordinates } from "../../model/interfaces/application";
import { readImage } from "../../services/image-upload";
import { apiError } from "../../services/api-error";
import { finalize } from "rxjs";
@Component({
  selector: "app-reporte-nuevo",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
    ReactiveFormsModule,
    MapaReporteComponent,
  ],
  templateUrl: "./reporte-nuevo.component.html",
  styleUrl: "./reporte-nuevo.component.css",
})
export class ReporteNuevoComponent {
  store: ApplicationService = inject(ApplicationService);
  fb: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  geo: GeolocationService = inject(GeolocationService);
  form: FormGroup;
  file: File;
  readonly photo = signal("");
  readonly error = signal("");
  readonly locating = signal(false);
  readonly submitting = signal(false);
  readonly center = signal<Coordinates | null>([-12.0464, -77.0428]);
  readonly coordinates = signal<Coordinates | null>(null);
  constructor() {
    this.form = this.fb.group({
      waste: [
        String(this.store.wasteTypes()[0]?.idTipoResiduo ?? ""),
        Validators.required,
      ],
      description: [
        "",
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.pattern(/.*\S.*/s),
        ],
      ],
      latitude: [
        "",
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        "",
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
    });
    this.form.valueChanges.subscribe((v) =>
      this.coordinates.set(
        v.latitude !== "" &&
          v.longitude !== "" &&
          Number.isFinite(Number(v.latitude)) &&
          Number.isFinite(Number(v.longitude))
          ? [Number(v.latitude), Number(v.longitude)]
          : null,
      ),
    );
    afterNextRender(() => {
      void this.locateIfGranted();
    });
  }
  invalid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.invalid;
  }
  pick(coords: Coordinates): void {
    this.form.patchValue({
      latitude: coords[0].toFixed(6),
      longitude: coords[1].toFixed(6),
    });
    this.center.set(coords);
  }
  async locate(): Promise<void> {
    this.locating.set(true);
    try {
      this.pick(await this.geo.current());
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      this.locating.set(false);
    }
  }
  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photo.set("");
    try {
      this.photo.set(await readImage(file));
      this.file = file;
      this.error.set("");
    } catch (e) {
      this.error.set(apiError(e));
      input.value = "";
    }
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.submitting()) return;
    if (!this.photo() || !this.file) {
      this.error.set("Adjunta una fotografía JPG o PNG.");
      return;
    }
    if (this.form.invalid || !this.coordinates()) {
      this.error.set("Completa la descripción, tipo y coordenadas válidas.");
      return;
    }
    this.submitting.set(true);
    this.error.set("");
    const v = this.form.value;
    this.store
      .addReport(v.description.trim(), v.waste, this.coordinates()!, this.file)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (report) => {
          this.store.confirmReport(report.id).subscribe({
            error: (e) =>
              this.store.error.set(
                "El reporte se guardó, pero no se pudo cargar su confirmación: " +
                  apiError(e),
              ),
          });
          void this.router.navigate(["/app/reportes", report.id], {
            queryParams: { creado: "1" },
          });
        },
        error: (e) => this.error.set(apiError(e)),
      });
  }
  private async locateIfGranted(): Promise<void> {
    try {
      if (
        navigator.permissions &&
        (await navigator.permissions.query({ name: "geolocation" })).state ===
          "granted"
      )
        await this.locate();
    } catch {}
  }
}
