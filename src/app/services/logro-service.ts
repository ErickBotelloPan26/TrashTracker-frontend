import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Logro } from "../model/logro";
import { LogroUsuario } from "../model/logro-usuario";
@Injectable({ providedIn: "root" })
export class LogroService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/logro";
  evaluate(): Observable<void> {
    return this.httpClient.post<void>(environment.apiURL + "/logro-usuario/usuario/evaluar", {});
  }
  list(): Observable<Logro[]> {
    return this.httpClient.get<Logro[]>(this.url + "/listar");
  }
  user(id: string) {
    return this.httpClient.get<LogroUsuario[]>(
      environment.apiURL + "/logro-usuario/usuario/" + id,
    );
  }
}
