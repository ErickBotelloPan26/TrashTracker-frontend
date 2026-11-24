import { MatTabsModule } from "@angular/material/tabs";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { toSignal } from "@angular/core/rxjs-interop";
import { GroupRole } from "../../model/interfaces/application";
import { Component, computed, DestroyRef, effect, inject, signal, untracked } from "@angular/core";
import { ChatTiempoRealService } from "../../services/chat-tiempo-real-service";
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
  selector: "app-grupo-detalle",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    RouterLink,
    FormsModule,
    DatePipe,
  ],
  templateUrl: "./grupo-detalle.component.html",
  styleUrl: "./grupo-detalle.component.css",
})
export class GrupoDetalleComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chat = inject(ChatTiempoRealService);
  readonly chatStatus = signal("conectando");
  readonly chatLabel = computed(() => ({ conectado: "Conectado", conectando: "Conectando…", reconectando: "Reconectando…", "sin-acceso": "Sin acceso al chat", desconectado: "Desconectado" })[this.chatStatus()] || "Conectando…");
  private readonly chatKey = computed(() => {
    const group = this.group();
    return group && this.store.role(group.id) ? [group.id, this.store.profile().id, this.store.session.token()].join("|") : "";
  });
  readonly saving = signal(false);
  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.reload());
    effect(onCleanup => {
      const key = this.chatKey();
      untracked(() => {
        if (!key) { this.chatStatus.set("desconectado"); return; }
        const [id, owner] = key.split("|");
        this.chatStatus.set("conectando");
        const subscription = this.chat.conectar(id).subscribe({
          next: event => {
            if (owner !== this.store.profile().id || this.group()?.id !== id) return;
            if (event.tipo === "mensaje") this.store.recibirMensaje(id, event.mensaje);
            else if (event.tipo === "conectado") {
              this.chatStatus.set("conectado");
              this.store.refreshGroupMessages(id).pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({ error: e => this.notice.set(apiError(e)) });
            } else if (event.tipo === "sin-acceso") {
              this.chatStatus.set("sin-acceso");
              this.store.groups.update(rows => rows.map(g => g.id === id ? { ...g, messages: [], members: g.members.filter(m => m.userId !== owner) } : g));
              this.notice.set("Ya no tienes acceso al chat de este grupo.");
            } else this.chatStatus.set("reconectando");
          },
          error: e => {
            if (!this.store.session.valid()) this.store.clear();
            this.chatStatus.set("desconectado"); this.notice.set(apiError(e));
          },
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }
  reload(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id)
      this.store
        .loadGroup(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: (e) => this.notice.set(apiError(e)) });
  }

  readonly store = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  readonly tab = signal("general");
  readonly text = signal("");
  readonly notice = signal("");
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly group = computed(() =>
    this.store.groups().find((g) => g.id === this.params().get("id")),
  );
  readonly groupEvents = computed(() =>
    this.store.events().filter((e) => e.groupId === this.group()?.id),
  );
  join(): void {
    if (this.saving()) return;
    const g = this.group();
    if (g)
      defer(() => {
        this.saving.set(true);
        return this.store.joinGroup(g.id);
      })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.notice.set("Ahora formas parte del grupo.");
            this.reload();
          },
          error: (e) => this.notice.set(apiError(e)),
        });
  }
  send(): void {
    if (this.saving()) return;
    const g = this.group();
    if (g && this.text().trim())
      defer(() => {
        this.saving.set(true);
        return this.store.sendMessage(g.id, this.text().trim());
      })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.text.set("");
            this.notice.set("Mensaje enviado.");
          },
          error: (e) => this.notice.set(apiError(e)),
        });
  }
  changeRole(userId: string, role: GroupRole): void {
    if (this.saving()) return;
    const g = this.group();
    if (g)
      defer(() => {
        this.saving.set(true);
        return this.store.assignRole(g.id, userId, role);
      })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.notice.set("Rol actualizado."),
          error: (e) => {
            this.notice.set(apiError(e));
            this.reload();
          },
        });
  }
}
