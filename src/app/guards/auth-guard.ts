import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { SessionService } from "../services/session-service";
import { ApplicationService } from "../services/application-service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private session: SessionService,
    private store: ApplicationService,
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (!this.session.valid()) {
      this.store.clear();
      return this.router.createUrlTree(["/login"]);
    }
    return this.store.ensureLoaded().pipe(
      map(() => true),
      catchError((error) => of(this.router.createUrlTree(
        error.status === 403 ? ["/acceso-denegado"] : ["/login"],
        error.status === 403 ? {} : { queryParams: { conexion: "error" } },
      ))),
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
