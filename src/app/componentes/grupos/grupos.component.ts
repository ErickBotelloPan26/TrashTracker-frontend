import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
import { GeolocationService } from "../../services/geolocation.service";
import { Coordinates } from "../../model/interfaces/application";
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
  selector: "app-grupos",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: "./grupos.component.html",
  styleUrl: "./grupos.component.css",
})
export class GruposComponent {
  readonly saving = signal(false);
  readonly store = inject(ApplicationService);
  readonly query = signal("");
  readonly district = signal("");
  readonly near = signal<Coordinates | null>(null);
  readonly notice = signal("");
  readonly locating = signal(false);
  private readonly geo = inject(GeolocationService);
  readonly districts = computed(() => [
    ...new Set(this.store.groups().map((g) => g.district)),
  ]);
  readonly filtered = computed(() =>
    this.store
      .groups()
      .filter(
        (g) =>
          (!this.query() ||
            (g.name + " " + g.description)
              .toLowerCase()
              .includes(this.query().toLowerCase())) &&
          (!this.district() || g.district === this.district()),
      )
      .sort(
        (a, b) => this.distance(a.coordinates) - this.distance(b.coordinates),
      ),
  );
  distance(coords: Coordinates): number {
    const pos = this.near();
    if (!pos) return 0;
    const rad = Math.PI / 180;
    const a =
      Math.sin(((coords[0] - pos[0]) * rad) / 2) ** 2 +
      Math.cos(pos[0] * rad) *
        Math.cos(coords[0] * rad) *
        Math.sin(((coords[1] - pos[1]) * rad) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  join(id: string): void {
    if (this.saving()) return;
    defer(() => {
      this.saving.set(true);
      return this.store.joinGroup(id);
    })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.notice.set("Te uniste al grupo."),
        error: (e) => this.notice.set(apiError(e)),
      });
  }
}
