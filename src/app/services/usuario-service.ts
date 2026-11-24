import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Usuario } from "../model/usuario";
import { EstadisticasUsuario } from "../model/estadisticas-usuario";

@Injectable({ providedIn: "root" })
export class UsuarioService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/usuario";
  statistics(id: string): Observable<EstadisticasUsuario> {
    return this.httpClient.get<EstadisticasUsuario>(this.url + "/" + id + "/estadisticas");
  }
  me(): Observable<Usuario> {
    return this.httpClient.get<Usuario>(this.url + "/yo");
  }
  update(
    id: string,
    nombre: string,
    idiomaPreferido: string,
  ): Observable<Usuario> {
    return this.httpClient.put<Usuario>(this.url + "/actualizar/" + id, {
      nombre,
      idiomaPreferido,
    });
  }
  updateProfile(nombre: string, apodo: string, idiomaPreferido: string, foto: File | null): Observable<Usuario> {
    const data = new FormData();
    data.append("nombre", nombre);
    data.append("apodo", apodo);
    data.append("idiomaPreferido", idiomaPreferido);
    if (foto) data.append("foto", foto);
    return this.httpClient.put<Usuario>(this.url + "/yo/perfil", data);
  }
  delete(id: string) {
    return this.httpClient.delete<void>(this.url + "/" + id);
  }
  getLocation(id: string) {
    return this.httpClient.get<{ latitud: number; longitud: number }>(
      this.url + "/obtener-ubicacion/" + id,
    );
  }
  location(id: string, latitud: number, longitud: number) {
    return this.httpClient.put(this.url + "/actualizar-ubicacion", {
      idUsuario: Number(id),
      latitud,
      longitud,
    });
  }
}
