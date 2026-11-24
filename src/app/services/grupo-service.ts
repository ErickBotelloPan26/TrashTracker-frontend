import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Grupo } from "../model/grupo";
import { MiembroGrupo } from "../model/miembro-grupo";
import { Mensaje } from "../model/mensaje";
@Injectable({ providedIn: "root" })
export class GrupoService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/grupo";
  list(): Observable<Grupo[]> {
    return this.httpClient.get<Grupo[]>(this.url + "/listar");
  }
  listMembers() {
    return this.httpClient.get<MiembroGrupo[]>(
      environment.apiURL + "/miembro-grupo/listar",
    );
  }
  members(id: string) {
    return this.httpClient.get<MiembroGrupo[]>(
      this.url + "/" + id + "/miembros",
    );
  }
  join(id: string, usuarioId: string) {
    return this.httpClient.post<MiembroGrupo>(
      this.url + "/" + id + "/unirse",
      null,
      { params: { usuarioId } },
    );
  }
  messages(id: string, usuarioId: string) {
    return this.httpClient.get<Mensaje[]>(this.url + "/" + id + "/mensajes", {
      params: { usuarioId },
    });
  }
  send(id: string, usuarioId: string, contenido: string) {
    return this.httpClient.post<Mensaje>(this.url + "/" + id + "/mensajes", {
      usuarioId: Number(usuarioId),
      contenido,
    });
  }
  role(id: string, user: string, requester: string, rol: string) {
    return this.httpClient.patch<MiembroGrupo>(
      this.url + "/" + id + "/miembros/" + user + "/rol",
      { solicitanteId: Number(requester), rol: rol.toUpperCase() },
    );
  }
}
