import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Evento } from "../model/evento";
import { Asistencia } from "../model/asistencia";
import { FotoEvento } from "../model/foto-evento";
import { ParticipanteEvento } from "../model/participante-evento";
@Injectable({ providedIn: "root" })
export class EventoService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/evento";
  get(id: string): Observable<Evento> {
    return this.httpClient.get<Evento>(this.url + "/buscar-por-id/" + id);
  }
  participants(id: string): Observable<ParticipanteEvento[]> {
    return this.httpClient.get<ParticipanteEvento[]>(this.url + "/" + id + "/participantes");
  }
  validateAttendance(id: string, userId: number, attended: boolean): Observable<ParticipanteEvento> {
    return this.httpClient.patch<ParticipanteEvento>(this.url + "/" + id + "/asistencia/" + userId, null,
      { params: { asistio: attended } });
  }
  list(): Observable<Evento[]> {
    return this.httpClient.get<Evento[]>(this.url + "/listar");
  }
  attendances() {
    return this.httpClient.get<Asistencia[]>(
      environment.apiURL + "/asistencia-evento/listar",
    );
  }
  photos() {
    return this.httpClient.get<FotoEvento[]>(
      environment.apiURL + "/foto-evento/listar",
    );
  }
  insert(
    grupoId: string,
    organizadorId: string,
    fecha: string,
    hora: string,
    ubicacion: string,
  ) {
    return this.httpClient.post<Evento>(this.url + "/crear", {
      grupoId: Number(grupoId),
      organizadorId: Number(organizadorId),
      fecha,
      hora,
      ubicacion,
    });
  }
  attend(id: string, usuarioId: string) {
    return this.httpClient.post(this.url + "/" + id + "/asistir", {
      usuarioId: Number(usuarioId),
      confirmado: true,
    });
  }
  upload(id: string, usuarioId: string, file: File) {
    const form = new FormData();
    form.append("usuarioId", usuarioId);
    form.append("fotos", file);
    return this.httpClient.post<FotoEvento[]>(
      this.url + "/" + id + "/fotos",
      form,
    );
  }
}
