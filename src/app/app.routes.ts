import { Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { AdminGuard } from "./guards/admin-guard";
export const routes: Routes = [
  {
    path: "acceso-denegado",
    redirectTo: "app/acceso-denegado",
    pathMatch: "full",
  },
  {
    path: "",
    title: "TrashTracker",
    loadComponent: () =>
      import("./componentes/pagina-principal/pagina-principal.component").then(
        (m) => m.PaginaPrincipalComponent,
      ),
  },
  {
    path: "login",
    title: "Iniciar sesión — TrashTracker",
    data: { mode: "login" },
    loadComponent: () =>
      import("./componentes/autenticacion/autenticacion.component").then((m) => m.AutenticacionComponent),
  },
  {
    path: "registro",
    title: "Crear cuenta — TrashTracker",
    data: { mode: "register" },
    loadComponent: () =>
      import("./componentes/autenticacion/autenticacion.component").then((m) => m.AutenticacionComponent),
  },
  {
    path: "recuperar-contrasena",
    title: "Recuperar contraseña — TrashTracker",
    data: { mode: "recovery" },
    loadComponent: () =>
      import("./componentes/autenticacion/autenticacion.component").then((m) => m.AutenticacionComponent),
  },
  {
    path: "app",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadComponent: () =>
      import("./componentes/panel-aplicacion/panel-aplicacion.component").then(
        (m) => m.PanelAplicacionComponent,
      ),
    children: [
      { path: "", redirectTo: "inicio", pathMatch: "full" },
      {
        path: "acceso-denegado",
        title: "Acceso denegado — TrashTracker",
        loadComponent: () =>
          import("./componentes/acceso-denegado/acceso-denegado.component").then(
            (m) => m.AccesoDenegadoComponent,
          ),
      },
      {
        path: "administracion/reportes",
        title: "Gestión de reportes — TrashTracker",
        canActivate: [AdminGuard],
        loadComponent: () =>
          import("./componentes/administracion-reportes/administracion-reportes.component").then(
            (m) => m.AdministracionReportesComponent,
          ),
      },
      {
        path: "administracion/reportes/:id",
        title: "Gestionar reporte — TrashTracker",
        canActivate: [AdminGuard],
        data: { administration: true },
        loadComponent: () =>
          import("./componentes/reporte-detalle/reporte-detalle.component").then(
            (m) => m.ReporteDetalleComponent,
          ),
      },
      {
        path: "inicio",
        title: "Inicio — TrashTracker",
        loadComponent: () =>
          import("./componentes/inicio/inicio.component").then(
            (m) => m.InicioComponent,
          ),
      },
      {
        path: "mapa",
        title: "Mapa de reportes — TrashTracker",
        loadComponent: () =>
          import("./componentes/mapa-comunitario/mapa-comunitario.component").then(
            (m) => m.MapaComunitarioComponent,
          ),
      },
      {
        path: "reportes/nuevo",
        title: "Crear reporte — TrashTracker",
        loadComponent: () =>
          import("./componentes/reporte-nuevo/reporte-nuevo.component").then(
            (m) => m.ReporteNuevoComponent,
          ),
      },
      {
        path: "reportes",
        title: "Mis reportes — TrashTracker",
        loadComponent: () =>
          import("./componentes/mis-reportes/mis-reportes.component").then(
            (m) => m.MisReportesComponent,
          ),
      },
      {
        path: "reportes/:id",
        title: "Detalle del reporte — TrashTracker",
        loadComponent: () =>
          import("./componentes/reporte-detalle/reporte-detalle.component").then(
            (m) => m.ReporteDetalleComponent,
          ),
      },
      {
        path: "perfil",
        title: "Mi perfil — TrashTracker",
        loadComponent: () =>
          import("./componentes/perfil/perfil.component").then(
            (m) => m.PerfilComponent,
          ),
      },
      {
        path: "grupos",
        title: "Grupos comunitarios — TrashTracker",
        loadComponent: () =>
          import("./componentes/grupos/grupos.component").then(
            (m) => m.GruposComponent,
          ),
      },
      {
        path: "grupos/:id",
        title: "Detalle del grupo — TrashTracker",
        loadComponent: () =>
          import("./componentes/grupo-detalle/grupo-detalle.component").then(
            (m) => m.GrupoDetalleComponent,
          ),
      },
      {
        path: "eventos/nuevo",
        title: "Crear evento — TrashTracker",
        loadComponent: () =>
          import("./componentes/evento-nuevo/evento-nuevo.component").then(
            (m) => m.EventoNuevoComponent,
          ),
      },
      {
        path: "eventos",
        title: "Eventos ambientales — TrashTracker",
        loadComponent: () =>
          import("./componentes/eventos/eventos.component").then(
            (m) => m.EventosComponent,
          ),
      },
      {
        path: "eventos/:id",
        title: "Detalle del evento — TrashTracker",
        loadComponent: () =>
          import("./componentes/evento-detalle/evento-detalle.component").then(
            (m) => m.EventoDetalleComponent,
          ),
      },
      {
        path: "recompensas",
        title: "Mis puntos y recompensas — TrashTracker",
        loadComponent: () =>
          import("./componentes/catalogo-recompensas/catalogo-recompensas.component").then(
            (m) => m.CatalogoRecompensasComponent,
          ),
      },
      {
        path: "logros",
        title: "Mis logros — TrashTracker",
        loadComponent: () =>
          import("./componentes/logros/logros.component").then(
            (m) => m.LogrosComponent,
          ),
      },
    ],
  },
  { path: "index.html", redirectTo: "", pathMatch: "full" },
  { path: "login.html", redirectTo: "login", pathMatch: "full" },
  { path: "registro.html", redirectTo: "registro", pathMatch: "full" },
  {
    path: "recuperar-pasword.html",
    redirectTo: "recuperar-contrasena",
    pathMatch: "full",
  },
  {
    path: "**",
    title: "Página no encontrada — TrashTracker",
    loadComponent: () =>
      import("./componentes/pagina-no-encontrada/pagina-no-encontrada.component").then(
        (m) => m.PaginaNoEncontradaComponent,
      ),
  },
];
