import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { ApplicationService } from "../services/application-service";
import { SessionService } from "../services/session-service";

@Injectable({ providedIn: "root" })
export class AdminGuard implements CanActivate {
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
      map(() => this.store.isAdmin() || this.router.createUrlTree(["/acceso-denegado"])),
      catchError((error) => of(this.router.createUrlTree(
        error.status === 403 ? ["/acceso-denegado"] : ["/login"],
        error.status === 403 ? {} : { queryParams: { conexion: "error" } },
      ))),
    );
  }
}
