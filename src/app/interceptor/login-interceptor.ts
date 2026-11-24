import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpStatusCode } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { SessionService } from "../services/session-service";

export const loginInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const api = request.url.startsWith(environment.apiURL + "/");
  const path = request.url.split("?")[0];
  const publicRoute = /\/(authenticate|usuario\/registro|usuario\/recuperar-contrasena|usuario\/restablecer-contrasena)$/.test(path);
  const token = session.token();
  const outgoing = api && !publicRoute && token
    ? request.clone({ setHeaders: { Authorization: "Bearer " + token } })
    : request;

  return next(outgoing).pipe(
    catchError((error) => {
      if (api && !publicRoute) {
        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            session.clear();
            void router.navigate(["/login"], { queryParams: { sesion: "expirada" } });
            break;
          case HttpStatusCode.Forbidden:
            void router.navigate(["/acceso-denegado"]);
            break;
        }
      }
      // Las pantallas reciben el error para finalizar su indicador de carga.
      return throwError(() => error);
    }),
  );
};
