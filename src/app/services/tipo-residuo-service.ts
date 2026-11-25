import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { TipoResiduo } from "../model/tipo-residuo";

@Injectable({ providedIn: "root" })
export class TipoResiduoService {
  httpClient: HttpClient = inject(HttpClient);
  private url = environment.apiURL + "/tipo-residuo";
  list(): Observable<TipoResiduo[]> {
    return this.httpClient.get<TipoResiduo[]>(this.url + "/listar");
  }
}
