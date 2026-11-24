import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { catchError, EMPTY, switchMap } from "rxjs";
import { apiError } from "../../services/api-error";
import { toSignal } from "@angular/core/rxjs-interop";
import { readImage } from "../../services/image-upload";
import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ParticipanteEvento } from "../../model/participante-evento";
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
  selector: "app-evento-detalle",
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterLink, DatePipe],
  templateUrl: "./evento-detalle.component.html",
  styleUrl: "./evento-detalle.component.css",
})
export class EventoDetalleComponent {
  constructor() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get("id");
        this.error.set("");
        this.loadingEvent.set(false);
        if (!id || this.store.events().some(e => e.id === id)) return EMPTY;
        this.loadingEvent.set(true);
        return this.store.loadEvent(id).pipe(
          catchError(e => { this.error.set(apiError(e)); return EMPTY; }),
          finalize(() => this.loadingEvent.set(false)),
        );
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }
  readonly loadingEvent = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  readonly participants = signal<ParticipanteEvento[]>([]);
  readonly participantsEventId = signal("");
  readonly participantsLoading = signal(false);
  readonly savingAttendance = signal<number | null>(null);
  readonly attendanceError = signal("");
  readonly attendanceNotice = signal("");
  readonly canManageAttendance = computed(() => {
    const event = this.event();
    return !!event && (this.store.isAdmin() || event.organizerId === this.store.profile().id || this.store.canOrganize(event.groupId));
  });
  loadParticipants(): void {
    const event = this.event();
    if (!event || !this.canManageAttendance() || !this.isPast(event.endsAt) || this.participantsLoading() || this.savingAttendance() !== null) return;
    this.participantsLoading.set(true);
    this.attendanceError.set("");
    this.store.evento.participants(event.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.participantsLoading.set(false)))
      .subscribe({
        next: rows => {
          if (event.id !== this.event()?.id) return;
          this.participants.set(rows);
          this.participantsEventId.set(event.id);
        },
        error: e => this.attendanceError.set(apiError(e)),
      });
  }
  validateAttendance(participant: ParticipanteEvento, attended: boolean): void {
    const event = this.event();
    if (!event || !this.canManageAttendance() || !this.isPast(event.endsAt) || this.savingAttendance() !== null || this.participantsEventId() !== event.id) return;
    this.savingAttendance.set(participant.usuarioId);
    this.attendanceError.set("");
    this.attendanceNotice.set("");
    this.store.evento.validateAttendance(event.id, participant.usuarioId, attended)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.savingAttendance.set(null)))
      .subscribe({
        next: row => {
          if (event.id !== this.event()?.id) return;
          this.participants.update(rows => rows.map(p => p.usuarioId === row.usuarioId ? row : p));
          this.attendanceNotice.set("Asistencia actualizada.");
        },
        error: e => this.attendanceError.set(apiError(e)),
      });
  }
  readonly saving = signal(false);
  readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  readonly notice = signal("");
  readonly error = signal("");
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly event = computed(() =>
    this.store.events().find((e) => e.id === this.params().get("id")),
  );
  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly created = computed(() => this.query().has("creado"));
  isPast(end: string): boolean {
    return Date.parse(end) < Date.now();
  }
  groupName(id: string): string {
    return this.store.groups().find((g) => g.id === id)?.name ?? "Comunidad";
  }
  attend(): void {
    if (this.saving()) return;
    const e = this.event();
    if (e)
      defer(() => {
        this.saving.set(true);
        return this.store.attendEvent(e.id);
      })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.notice.set("Inscripción confirmada."),
          error: (e) => this.error.set(apiError(e)),
        });
  }
  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const cleanup = this.event();
    if (!file || !cleanup) return;
    try {
      await readImage(file);
      this.store.addEventPhoto(cleanup.id, file).subscribe({
        next: () => {
          this.notice.set("Fotografía guardada.");
          this.error.set("");
        },
        error: (e) => this.error.set(apiError(e)),
      });
    } catch (e) {
      this.error.set(apiError(e));
    } finally {
      input.value = "";
    }
  }
}
