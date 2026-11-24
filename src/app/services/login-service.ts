import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { RequestDto } from "../model/request-dto";
import { ResponseDto } from "../model/response-dto";
import { SessionService } from "./session-service";

@Injectable({ providedIn: "root" })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly url = environment.apiURL;

  login(request: RequestDto, remember = false): Observable<ResponseDto> {
    return this.http
      .post<ResponseDto>(this.url + "/authenticate", request, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          const authorization = response.headers.get("Authorization");
          if (!authorization?.trim() || !response.body) {
            throw new Error("Token no encontrado en la respuesta del servidor.");
          }
          const token = authorization.replace(/^Bearer\s+/i, "").trim();
          if (!token) {
            throw new Error("Token no encontrado en la respuesta del servidor.");
          }
          this.session.save(token, remember, response.body.roles ?? []);
          return response.body;
        }),
      );
  }

  getToken(): string | null {
    return this.session.token() || null;
  }

  getRol(): string | null {
    return this.session.role() || null;
  }

  register(nombre: string, correo: string, contrasena: string) {
    return this.http.post(this.url + "/usuario/registro", {
      nombre, correo, contrasena,
    });
  }

  recover(correo: string) {
    return this.http.post<{ mensaje: string }>(
      this.url + "/usuario/recuperar-contrasena", { correo },
    );
  }

  reset(token: string, contrasena: string) {
    return this.http.post<void>(this.url + "/usuario/restablecer-contrasena", {
      token, contrasena,
    });
  }

  logout(id: string) {
    return this.http.post<void>(this.url + "/usuario/" + id + "/cerrar-sesion", {});
  }
}
