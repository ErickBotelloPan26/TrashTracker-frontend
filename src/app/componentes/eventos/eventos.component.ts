import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
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
  selector: "app-eventos",
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    RouterLink,
    DatePipe,
  ],
  templateUrl: "./eventos.component.html",
  styleUrl: "./eventos.component.css",
})
export class EventosComponent {
  readonly saving = signal(false);
  readonly store = inject(ApplicationService);
  readonly past = signal(false);
  readonly notice = signal("");
  readonly canCreate = computed(() =>
    this.store.groups().some((g) => this.store.canOrganize(g.id)),
  );
  readonly filtered = computed(() =>
    this.store
      .events()
      .filter((e) =>
        this.past()
          ? Date.parse(e.endsAt) < Date.now()
          : Date.parse(e.endsAt) >= Date.now(),
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
  );
  groupName(id: string): string {
    return (
      this.store.groups().find((g) => g.id === id)?.name ?? "Grupo comunitario"
    );
  }
  attend(id: string): void {
    if (this.saving()) return;
    defer(() => {
      this.saving.set(true);
      return this.store.attendEvent(id);
    })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.notice.set("Tu inscripción quedó confirmada."),
        error: (e) => this.notice.set(apiError(e)),
      });
  }
}
