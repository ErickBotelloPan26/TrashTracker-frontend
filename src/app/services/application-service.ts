import { computed, inject, Injectable, signal } from "@angular/core";
import {
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
  catchError,
  finalize,
  throwError,
} from "rxjs";
import {
  CitizenProfile,
  CitizenReport,
  CleanupEvent,
  CommunityGroup,
  GroupRole,
  GroupMessage,
  PointMovement,
  Redemption,
  ReportConfirmation,
  Achievement,
  ReportState,
} from "../model/interfaces/application";
import { LoginService } from "./login-service";
import { UsuarioService } from "./usuario-service";
import { ReporteService } from "./reporte-service";
import { GrupoService } from "./grupo-service";
import { EventoService } from "./evento-service";
import { RecompensaService } from "./recompensa-service";
import { HistorialPuntosService } from "./historial-puntos-service";
import { LogroService } from "./logro-service";
import { NotificacionService } from "./notificacion-service";
import { TipoResiduoService } from "./tipo-residuo-service";
import { SessionService } from "./session-service";
import { mapReport, mediaUrl } from "./api-mappers";
import { apiError } from "./api-error";
import { TipoResiduo } from "../model/tipo-residuo";
import { Mensaje } from "../model/mensaje";
import { Evento } from "../model/evento";
import { Asistencia } from "../model/asistencia";
import { FotoEvento } from "../model/foto-evento";
const emptyProfile = (): CitizenProfile => ({
  id: "",
  name: "",
  email: "",
  nickname: "",
  district: "",
  avatar: "",
});
@Injectable({ providedIn: "root" })
export class ApplicationService {
  auth: LoginService = inject(LoginService);
  usuario: UsuarioService = inject(UsuarioService);
  reporte: ReporteService = inject(ReporteService);
  grupo: GrupoService = inject(GrupoService);
  evento: EventoService = inject(EventoService);
  recompensa: RecompensaService = inject(RecompensaService);
  historial: HistorialPuntosService = inject(HistorialPuntosService);
  logro: LogroService = inject(LogroService);
  notificacion: NotificacionService = inject(NotificacionService);
  tipos: TipoResiduoService = inject(TipoResiduoService);
  session: SessionService = inject(SessionService);
  readonly profile = signal<CitizenProfile>(emptyProfile());
  readonly userRole = signal("");
  readonly isAdmin = computed(
    () =>
      this.userRole()
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, "") === "ADMINISTRADOR",
  );
  readonly reports = signal<CitizenReport[]>([]);
  readonly groups = signal<CommunityGroup[]>([]);
  readonly events = signal<CleanupEvent[]>([]);
  readonly rewards = signal<import("../model/interfaces/application").Reward[]>(
    [],
  );
  readonly points = signal<PointMovement[]>([]);
  readonly pointsSyncError = signal("");
  readonly redemptions = signal<Redemption[]>([]);
  readonly confirmations = signal<ReportConfirmation[]>([]);
  readonly notificationsSyncError = signal("");
  readonly achievements = signal<Achievement[]>([]);
  readonly achievementsSyncError = signal("");
  readonly achievementNotice = signal("");
  readonly wasteTypes = signal<TipoResiduo[]>([]);
  readonly balance = signal(0);
  readonly level = signal(1);
  readonly levelName = computed(
    () =>
      [
        "Principiante Eco",
        "Eco-Activista",
        "Protector Verde",
        "Guardián Ambiental",
        "Héroe Reciclador",
      ][Math.max(0, Math.min(4, this.level() - 1))],
  );
  readonly language = signal("es");
  readonly loading = signal(false);
  readonly error = signal("");
  readonly active = computed(() => !!this.profile().id);
  readonly myReports = computed(() =>
    this.reports().filter((r) => r.authorId === this.profile().id),
  );
  refreshNotifications(): Observable<void> {
    const generation = this.generation, owner = this.profile().id;
    if (!owner || !this.session.valid()) return of(undefined);
    return this.notificacion.list().pipe(
      tap(rows => {
        if (generation !== this.generation || owner !== this.profile().id) return;
        this.confirmations.set(rows.filter(n => String(n.usuarioId) === owner).map(n => ({
          id: String(n.idNotificacion),
          reportId: n.tipo === "CONFIRMACION_REPORTE" ? (n.contenido.match(/#(\d+)/)?.[1] ?? "") : "",
          eventId: n.eventoId == null ? "" : String(n.eventoId),
          text: n.contenido, createdAt: n.fecha,
        })));
        this.notificationsSyncError.set("");
      }), map(() => undefined),
    );
  }
  refreshPoints(): Observable<void> {
    const generation = this.generation;
    const owner = this.profile().id;
    if (!owner || !this.session.valid()) return of(undefined);
    return forkJoin({ user: this.usuario.me(), rows: this.historial.list() }).pipe(
      tap(({ user, rows }) => {
        if (generation !== this.generation || owner !== this.profile().id || String(user.idUsuario) !== owner) {
          throw new Error("La sesión cambió.");
        }
        this.balance.set(user.puntosTotales ?? 0);
        this.level.set(user.nivel ?? 1);
        this.points.set(rows.filter(p => String(p.usuarioId) === owner).map(p => ({
          id: String(p.idHistorialPuntos), points: p.cantidad, concept: p.motivo, createdAt: p.fecha,
        })));
        this.pointsSyncError.set("");
      }),
      map(() => undefined),
    );
  }
  private loaded = false;
  refreshAchievements(reconcile = false): Observable<void> {
    const generation = this.generation, owner = this.profile().id;
    if (!owner || !this.session.valid()) return of(undefined);
    const start = reconcile ? this.logro.evaluate() : of(undefined);
    return start.pipe(
      switchMap(() => forkJoin({ catalog: this.logro.list(), unlocked: this.logro.user(owner) })),
      tap(({ catalog, unlocked }) => {
        if (generation !== this.generation || owner !== this.profile().id) throw new Error("La sesión cambió.");
        const ids = new Set(unlocked.filter(l => l.desbloqueado).map(l => String(l.idLogro)));
        const newlyUnlocked = this.achievements().filter(a => !a.unlocked && ids.has(a.id)).map(a => a.title);
        this.achievements.set(catalog.map(a => ({ id: String(a.idLogro), title: a.nombre, description: a.criterio, icon: "medal", unlocked: ids.has(String(a.idLogro)) })));
        if (newlyUnlocked.length) this.achievementNotice.set("Logro desbloqueado: " + newlyUnlocked.join(", ") + ".");
        this.achievementsSyncError.set("");
      }),
      map(() => undefined),
    );
  }
  private refreshAchievementsAfterAction<T>(value: T): Observable<T> {
    return this.refreshAchievements().pipe(
      catchError(() => {
        this.achievementsSyncError.set("No se pudieron actualizar tus logros. Se volverá a consultar automáticamente.");
        return of(undefined);
      }),
      map(() => value),
    );
  }
  private generation = 0;
  load(): Observable<void> {
    const generation = this.generation;
    this.loading.set(true);
    this.error.set("");
    return this.usuario.me().pipe(
      switchMap((user) => {
        if (generation !== this.generation) throw Error("La sesión cambió.");
        this.profile.set({
          id: String(user.idUsuario),
          name: user.nombre,
          email: user.correo,
          nickname: user.apodo ?? "",
          district: "",
          avatar: user.fotoPerfil ? mediaUrl(user.fotoPerfil) : "",
        });
        this.balance.set(user.puntosTotales ?? 0);
        this.level.set(user.nivel ?? 1);
        this.userRole.set(user.rol ?? "");
        this.session.updateRole(user.rol ?? "");
        this.language.set(user.idiomaPreferido || "es");
        return forkJoin({
          reports: this.reporte.list(),
          groups: this.grupo.list(),
          members: this.grupo.listMembers(),
          events: this.evento.list(),
          attendances: this.evento.attendances(),
          photos: this.evento.photos(),
          rewards: this.recompensa.list(),
          points: this.historial.list(),
          redemptions: this.recompensa.redemptions(),
          achievements: this.logro.list(),
          unlocked: this.logro.user(String(user.idUsuario)),
          notifications: this.notificacion.list(),
          types: this.tipos.list(),
        });
      }),
      tap((data) => {
        if (generation !== this.generation) throw Error("La sesión cambió.");
        this.reports.set(
          data.reports
            .map(mapReport)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
        this.groups.set(
          data.groups.map((g) => ({
            id: String(g.idGrupo),
            name: g.nombre,
            district: g.zona || "",
            description: "",
            image: this.groupImage(g.nombre),
            coordinates: [0, 0],
            totalMembers: g.totalMiembros,
            members: data.members
              .filter((m) => m.grupoId === g.idGrupo)
              .map((m) => ({
                userId: String(m.usuarioId),
                name: m.usuarioNombre,
                role: m.rolEnGrupo.toLowerCase() as GroupRole,
              })),
            messages:
              this.groups().find((old) => old.id === String(g.idGrupo))
                ?.messages ?? [],
          })),
        );
        this.events.set(data.events.map(e => this.mapEvent(e, data.attendances, data.photos)));
        this.rewards.set(
          data.rewards.map((r) => ({
            id: String(r.idRecompensa),
            name: r.nombre,
            description: "",
            cost: r.costoPuntos,
            stock: r.stock,
            icon: "gift",
          })),
        );
        this.points.set(
          data.points
            .filter((p) => String(p.usuarioId) === this.profile().id)
            .map((p) => ({
              id: String(p.idHistorialPuntos),
              points: p.cantidad,
              concept: p.motivo,
              createdAt: p.fecha,
            })),
        );
        this.redemptions.set(
          data.redemptions
            .filter((c) => String(c.usuarioId) === this.profile().id)
            .map((c) => ({
              id: String(c.idCanje),
              rewardId: String(c.recompensaId),
              rewardName: c.recompensaNombre,
              state: c.estado,
              points: 0,
              createdAt: c.fecha,
            })),
        );
        this.achievements.set(
          data.achievements.map((a) => ({
            id: String(a.idLogro),
            title: a.nombre,
            description: a.criterio,
            icon: "medal",
            unlocked: data.unlocked.some(
              (u) => u.idLogro === a.idLogro && u.desbloqueado,
            ),
          })),
        );
        this.confirmations.set(
          data.notifications
            .filter((n) => String(n.usuarioId) === this.profile().id)
            .map((n) => ({
              id: String(n.idNotificacion),
              eventId: n.eventoId == null ? "" : String(n.eventoId),
              reportId:
                n.tipo === "CONFIRMACION_REPORTE"
                  ? (n.contenido.match(/#(\d+)/)?.[1] ?? "")
                  : "",
              text: n.contenido,
              createdAt: n.fecha,
            })),
        );
        this.wasteTypes.set(data.types);
        this.loaded = true;
      }),
      map(() => undefined),
      catchError((error) => {
        this.error.set(apiError(error));
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }
  ensureLoaded(): Observable<boolean> {
    return this.loaded && this.active()
      ? of(true)
      : this.load().pipe(map(() => true));
  }
  clear(): void {
    this.notificationsSyncError.set("");
    this.achievementsSyncError.set("");
    this.achievementNotice.set("");
    this.pointsSyncError.set("");
    this.generation++;
    this.loaded = false;
    this.session.clear();
    this.profile.set(emptyProfile());
    this.userRole.set("");
    this.reports.set([]);
    this.groups.set([]);
    this.events.set([]);
    this.rewards.set([]);
    this.points.set([]);
    this.redemptions.set([]);
    this.confirmations.set([]);
    this.achievements.set([]);
    this.wasteTypes.set([]);
    this.balance.set(0);
    this.level.set(1);
  }
  logout(): Observable<void> {
    return this.auth.logout(this.profile().id).pipe(tap(() => this.clear()));
  }
  updateProfile(name: string, language: string, nickname: string, photo: File | null) {
    const owner = this.profile().id, generation = this.generation;
    return this.usuario.updateProfile(name, nickname, language, photo).pipe(
      tap((user) => {
        if (generation !== this.generation || owner !== this.profile().id) return;
        this.profile.update((p) => ({ ...p, name: user.nombre, nickname: user.apodo ?? "", avatar: user.fotoPerfil ? mediaUrl(user.fotoPerfil) : "" }));
        this.language.set(user.idiomaPreferido);
      }),
    );
  }
  deleteAccount() {
    return this.usuario.delete(this.profile().id).pipe(tap(() => this.clear()));
  }
  addReport(
    description: string,
    typeId: string,
    coordinates: [number, number],
    file: File,
  ) {
    const form = new FormData();
    form.append("foto", file);
    form.append("tipoResiduoId", typeId);
    form.append("descripcion", description);
    form.append("latitud", String(coordinates[0]));
    form.append("longitud", String(coordinates[1]));
    return this.reporte.insert(form).pipe(
      tap((r) => this.reports.update((rows) => [mapReport(r), ...rows])),
      map(mapReport),
      switchMap(report => this.refreshAchievementsAfterAction(report)),
    );
  }
  confirmReport(id: string) {
    return this.reporte.confirm(id).pipe(switchMap(() => this.load()));
  }
  deleteReport(id: string) {
    return this.reporte.delete(id).pipe(
      tap(() => {
        this.reports.update((rows) => rows.filter((r) => r.id !== id));
        this.confirmations.update((rows) =>
          rows.filter((n) => n.reportId !== id),
        );
      }),
    );
  }
  refreshReports(): Observable<void> {
    const generation = this.generation;
    return this.reporte.list().pipe(
      tap((rows) => {
        if (generation !== this.generation)
          throw new Error("La sesión cambió. Vuelve a iniciar sesión.");
        this.reports.set(
          rows
            .map(mapReport)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
      }),
      map(() => undefined),
    );
  }
  updateReportState(id: string, state: ReportState): Observable<CitizenReport> {
    return this.applyReportUpdate(this.reporte.updateState(id, state));
  }
  resolveReport(id: string): Observable<CitizenReport> {
    return this.applyReportUpdate(this.reporte.markClean(id));
  }
  private applyReportUpdate(
    request: Observable<import("../model/reporte").Reporte>,
  ): Observable<CitizenReport> {
    const generation = this.generation;
    return request.pipe(
      map(mapReport),
      tap((report) => {
        if (generation !== this.generation)
          throw new Error("La sesión cambió. Vuelve a iniciar sesión.");
        this.reports.update((rows) =>
          rows.map((row) => (row.id === report.id ? report : row)),
        );
      }),
      switchMap(report => report.state === "resolved" && report.authorId === this.profile().id
        ? this.refreshPoints().pipe(
            catchError(() => {
              this.pointsSyncError.set("No se pudo actualizar tu saldo. Se volverá a consultar automáticamente.");
              return of(undefined);
            }),
            map(() => report),
          )
        : of(report)),
      switchMap(report => report.authorId === this.profile().id ? this.refreshAchievementsAfterAction(report) : of(report)),
    );
  }
  role(id: string): GroupRole | undefined {
    return this.groups()
      .find((g) => g.id === id)
      ?.members.find((m) => m.userId === this.profile().id)?.role;
  }
  canOrganize(id: string): boolean {
    return ["organizador", "administrador"].includes(this.role(id) ?? "");
  }
  joinGroup(id: string) {
    return this.grupo
      .join(id, this.profile().id)
      .pipe(switchMap(() => this.load()));
  }
  loadGroup(id: string): Observable<void> {
    if (!this.role(id)) return of(undefined);
    const generation = this.generation, owner = this.profile().id;
    return forkJoin({
      members: this.grupo.members(id),
      messages: this.grupo.messages(id, this.profile().id),
    }).pipe(
      tap((data) => {
        if (generation !== this.generation || owner !== this.profile().id || !this.role(id)) return;
        this.groups.update((rows) =>
          rows.map((g) =>
            g.id === id
              ? {
                  ...g,
                  members: data.members.map((m) => ({
                    userId: String(m.usuarioId),
                    name: m.usuarioNombre,
                    role: m.rolEnGrupo.toLowerCase() as GroupRole,
                  })),
                  messages: this.combinarMensajes(g.messages, data.messages),
                }
              : g,
          ),
        );
      }),
      map(() => undefined),
    );
  }
  sendMessage(id: string, text: string) {
    return this.grupo
      .send(id, this.profile().id, text)
      .pipe(tap(mensaje => this.recibirMensaje(id, mensaje)), map(() => undefined));
  }
  refreshGroupMessages(id: string): Observable<void> {
    if (!this.role(id)) return of(undefined);
    const generation = this.generation, owner = this.profile().id;
    return this.grupo.messages(id, owner).pipe(
      tap(rows => {
        if (generation === this.generation && owner === this.profile().id && this.role(id)) {
          this.groups.update(groups => groups.map(g => g.id === id ? { ...g, messages: this.combinarMensajes(g.messages, rows) } : g));
        }
      }), map(() => undefined),
    );
  }
  recibirMensaje(id: string, mensaje: Mensaje): void {
    if (!this.role(id) || String(mensaje.grupoId) !== id) return;
    this.groups.update(groups => groups.map(g => g.id === id ? { ...g, messages: this.combinarMensajes(g.messages, [mensaje]) } : g));
  }
  private combinarMensajes(actuales: GroupMessage[], recibidos: Mensaje[]): GroupMessage[] {
    const mensajes = new Map(actuales.map(m => [m.id, m]));
    for (const m of recibidos) mensajes.set(String(m.idMensaje), {
      id: String(m.idMensaje), authorId: String(m.usuarioId), author: m.usuarioNombre || "Miembro",
      text: m.contenido, createdAt: m.fechaHora,
    });
    return [...mensajes.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id, "es", { numeric: true }));
  }
  assignRole(id: string, user: string, role: GroupRole) {
    return this.grupo
      .role(id, user, this.profile().id, role)
      .pipe(switchMap(() => this.loadGroup(id)));
  }
  createEvent(groupId: string, date: string, time: string, address: string) {
    return this.evento
      .insert(groupId, this.profile().id, date, time, address)
      .pipe(
        switchMap((e) =>
          this.load().pipe(map(() => ({ id: String(e.idEvento) }))),
        ),
      );
  }
  attendEvent(id: string) {
    return this.evento
      .attend(id, this.profile().id)
      .pipe(switchMap(() => this.load()));
  }
  canUploadEventPhoto(event: CleanupEvent): boolean {
    return (
      !!this.role(event.groupId) || event.attendees.includes(this.profile().id)
    );
  }
  addEventPhoto(id: string, file: File) {
    return this.evento
      .upload(id, this.profile().id, file)
      .pipe(switchMap(() => this.load()));
  }
  redeemReward(id: string) {
    return this.recompensa
      .redeem(id, this.profile().id)
      .pipe(switchMap(() => this.load()));
  }
  loadEvent(id: string): Observable<void> {
    const generation = this.generation, owner = this.profile().id;
    return forkJoin({ event: this.evento.get(id), attendances: this.evento.attendances(), photos: this.evento.photos() }).pipe(
      tap(data => {
        if (generation !== this.generation || owner !== this.profile().id || String(data.event.idEvento) !== id) return;
        const event = this.mapEvent(data.event, data.attendances, data.photos);
        this.events.update(rows => rows.some(e => e.id === id) ? rows.map(e => e.id === id ? event : e) : [...rows, event]);
      }), map(() => undefined),
    );
  }
  private mapEvent(e: Evento, attendances: Asistencia[], photos: FotoEvento[]): CleanupEvent {
    return {
            id: String(e.idEvento),
            title: "Jornada de " + e.grupoNombre,
            organizerId: e.organizadorId == null ? "" : String(e.organizadorId),
            description:
              "Jornada de limpieza organizada por " + e.grupoNombre + ".",
            groupId: String(e.grupoId),
            startsAt: e.fecha + "T" + (e.hora || "00:00:00"),
            startTime: e.hora?.slice(0, 5) || "",
            endsAt: e.fecha + "T23:59:59",
            address: e.ubicacion,
            district: "",
            image: "assets/img/ui/imgSection.jpg",
            totalAttendees: e.totalConfirmados,
            attendees: attendances
              .filter((a) => a.eventoId === e.idEvento && a.confirmado)
              .map((a) => String(a.usuarioId)),
            photos: photos
              .filter((p) => p.eventoId === e.idEvento)
              .map((p) => ({
                id: String(p.idFotoEvento),
                authorId: String(p.usuarioId),
                url: mediaUrl(p.urlFoto),
                caption: "Fotografía de la jornada",
              })),
    };
  }
  private groupImage(name: string): string {
    const lower = name.toLowerCase();
    const image = lower.includes("econauta")
      ? "imgEconautas.png"
      : lower.includes("reciclador")
        ? "imgRecicladores.png"
        : lower.includes("guardi")
          ? "imgGuardianes.png"
          : lower.includes("vecino")
            ? "imgVecinos.png"
            : "imgSection.jpg";
    return "assets/img/ui/" + image;
  }
}
