import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Reporte } from "../model/reporte";
import { ReportState } from "../model/interfaces/application";
@Injectable({ providedIn: "root" })
export class ReporteService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/reportes";
  list(): Observable<Reporte[]> {
    return this.httpClient.get<Reporte[]>(this.url + "/mapa/todos");
  }
  mine(): Observable<Reporte[]> {
    return this.httpClient.get<Reporte[]>(this.url + "/listar");
  }
  listId(id: string) {
    return this.httpClient.get<Reporte>(this.url + "/buscar-por-id/" + id);
  }
  insert(data: FormData) {
    return this.httpClient.post<Reporte>(this.url + "/insertar", data);
  }
  delete(id: string) {
    return this.httpClient.delete<void>(this.url + "/eliminar/" + id);
  }
  confirm(id: string) {
    return this.httpClient.post(this.url + "/notificar-confirmacion/" + id, {});
  }
  updateState(id: string, state: ReportState): Observable<Reporte> {
    const values: Record<ReportState, string> = {
      active: "ACTIVO",
      progress: "EN_PROCESO",
      resolved: "LIMPIADO",
    };
    return this.httpClient.patch<Reporte>(
      this.url + "/admin/" + id + "/estado",
      null,
      { params: { estado: values[state] } },
    );
  }
  markClean(id: string): Observable<Reporte> {
    return this.httpClient.patch<Reporte>(
      this.url + "/admin/" + id + "/limpiar",
      null,
    );
  }
}
