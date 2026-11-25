import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HistorialPuntos } from "../model/historial-puntos";

@Injectable({ providedIn: "root" })
export class HistorialPuntosService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/historial-puntos";
  list(): Observable<HistorialPuntos[]> {
    return this.httpClient.get<HistorialPuntos[]>(this.url + "/listar");
  }
}
