import { MatBadgeModule } from "@angular/material/badge";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { apiError } from "../../services/api-error";
import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, exhaustMap, filter, forkJoin, fromEvent, merge, of, timer } from "rxjs";
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
  selector: "app-panel-aplicacion",
  standalone: true,
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    DatePipe,
  ],
  templateUrl: "./panel-aplicacion.component.html",
  styleUrl: "./panel-aplicacion.component.css",
})
export class PanelAplicacionComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    merge(timer(0, 15000), fromEvent(window, "focus"), fromEvent(document, "visibilitychange"))
      .pipe(
        filter(() => document.visibilityState !== "hidden" && this.store.session.valid()),
        exhaustMap(() => forkJoin({
          points: this.store.refreshPoints().pipe(catchError(() => {
            this.store.pointsSyncError.set("No se pudo actualizar tu saldo. Se volverá a consultar automáticamente.");
            return of(undefined);
          })),
          achievements: this.store.refreshAchievements().pipe(catchError(() => {
            this.store.achievementsSyncError.set("No se pudieron actualizar tus logros. Se volverá a consultar automáticamente.");
            return of(undefined);
          })),
          notifications: this.store.refreshNotifications().pipe(catchError(() => {
            this.store.notificationsSyncError.set("No se pudieron actualizar las notificaciones. Se volverá a consultar automáticamente.");
            return of(undefined);
          })),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  get onDashboard(): boolean {
    return this.router.url.split("?")[0] === "/app/inicio";
  }
  readonly store = inject(ApplicationService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly nav = computed(() => [
    { path: "/app/inicio", label: "Inicio" },
    {
      path: this.store.isAdmin()
        ? "/app/administracion/reportes"
        : "/app/reportes",
      label: "Reportes",
    },
    { path: "/app/mapa", label: "Mapa" },
    { path: "/app/grupos", label: "Grupos" },
    { path: "/app/eventos", label: "Eventos" },
    { path: "/app/recompensas", label: "Recompensas" },
    { path: "/app/logros", label: "Logros" },
    { path: "/app/perfil", label: "Perfil" },
  ]);
  toggleNotifications(): void {
    this.notificationsOpen.set(!this.notificationsOpen());
    if (this.notificationsOpen())
      this.store
        .refreshNotifications()
        .subscribe({ error: (e) => this.store.notificationsSyncError.set(apiError(e)) });
  }
  reload(): void {
    this.store.load().subscribe({ error: () => {} });
  }
  logout(): void {
    this.store.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl("/login");
      },
      error: (e) => this.store.error.set(apiError(e)),
    });
  }
}
