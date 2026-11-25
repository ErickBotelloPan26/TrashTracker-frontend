import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCardModule } from "@angular/material/card";
import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApplicationService } from "../../services/application-service";
import {
  STATE_LABELS,
  CleanupEvent,
  CommunityGroup,
} from "../../model/interfaces/application";

@Component({
  selector: "app-inicio",
  standalone: true,
  imports: [MatCardModule, MatProgressBarModule, RouterLink],
  templateUrl: "./inicio.component.html",
  styleUrl: "./inicio.component.css",
})
export class InicioComponent {
  readonly store = inject(ApplicationService);
  readonly labels = STATE_LABELS;
  readonly failedPhotos = signal(new Set<string>());
  photoFailed(id: string): void {
    this.failedPhotos.update((ids) => new Set([...ids, id]));
  }
  readonly recent = computed(() =>
    [...this.store.myReports()]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 3),
  );
  readonly activeReports = computed(
    () => this.store.myReports().filter((r) => r.state === "active").length,
  );
  readonly inProgress = computed(
    () => this.store.myReports().filter((r) => r.state === "progress").length,
  );
  readonly nextEvent = computed<CleanupEvent | undefined>(
    () =>
      this.store
        .events()
        .filter((e) => Date.parse(e.endsAt) >= Date.now())
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0],
  );
  readonly activeGroup = computed<CommunityGroup | undefined>(() => {
    const memberships = this.store
      .groups()
      .filter((g) => this.store.role(g.id));
    return (
      memberships.find((g) => g.id === this.nextEvent()?.groupId) ??
      memberships[0]
    );
  });
  readonly progress = computed(() => {
    const level = Math.max(1, Math.min(5, this.store.level()));
    const target = [100, 300, 600, 1000][level - 1] ?? 0;
    const points = Math.max(0, this.store.balance());
    return {
      target,
      percent: target ? Math.min(100, (points / target) * 100) : 100,
      remaining: Math.max(0, target - points),
    };
  });
  readonly shortcuts = [
    {
      path: "/app/reportes/nuevo",
      icon: "circle-plus",
      title: "Crear Reporte",
      text: "Sube una foto y ubica la incidencia",
    },
    {
      path: "/app/mapa",
      icon: "map",
      title: "Ver Mapa",
      text: "Mapa interactivo de reportes comunitarios",
    },
    {
      path: "/app/grupos",
      icon: "users",
      title: "Mis Grupos",
      text: "Foros vecinales y acción directa",
    },
    {
      path: "/app/eventos",
      icon: "calendar-days",
      title: "Eventos",
      text: "Únete a las jornadas de limpieza voluntaria",
    },
  ];
  number(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
  }
  eventWhen(date: string): string {
    const target = new Date(date),
      today = new Date();
    const days = Math.round(
      (Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) -
        Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
        86400000,
    );
    return days <= 0 ? "Hoy" : days === 1 ? "Mañana" : `En ${days} días`;
  }
  reportWhen(date: string): string {
    const target = new Date(date),
      today = new Date();
    const days = Math.round(
      (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
        Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())) /
        86400000,
    );
    if (days === 0)
      return (
        "Hoy, " +
        target.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    if (days === 1) return "Ayer";
    return days > 1 && days < 7
      ? `Hace ${days} días`
      : target.toLocaleDateString("es-PE");
  }
}
