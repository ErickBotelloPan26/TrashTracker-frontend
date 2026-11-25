import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Recompensa } from "../model/recompensa";
import { Canje } from "../model/canje";
@Injectable({ providedIn: "root" })
export class RecompensaService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/recompensa";
  list(): Observable<Recompensa[]> {
    return this.httpClient.get<Recompensa[]>(this.url + "/listar");
  }
  redeem(id: string, usuario: string) {
    return this.httpClient.post(environment.apiURL + "/canje/realizar-canje", {
      idUsuario: Number(usuario),
      idRecompensa: Number(id),
    });
  }
  redemptions() {
    return this.httpClient.get<Canje[]>(environment.apiURL + "/canje/listar");
  }
}
