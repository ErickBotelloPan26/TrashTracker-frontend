import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Notificacion } from "../model/notificacion";

@Injectable({ providedIn: "root" })
export class NotificacionService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/notificacion";
  list(): Observable<Notificacion[]> {
    return this.httpClient.get<Notificacion[]>(this.url + "/listar");
  }
  read(id: number) {
    return this.httpClient.put<Notificacion>(this.url + "/actualizar/" + id, {
      leido: true,
    });
  }
}
