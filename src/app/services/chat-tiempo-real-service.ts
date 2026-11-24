import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { EventoChatTiempoReal } from "../model/interfaces/evento-chat-tiempo-real";
import { Mensaje } from "../model/mensaje";
import { SessionService } from "./session-service";

@Injectable({ providedIn: "root" })
export class ChatTiempoRealService {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  conectar(grupoId: string): Observable<EventoChatTiempoReal> {
    return new Observable(subscriber => {
      const abort = new AbortController();
      const token = this.session.token();
      let cerrado = false, intentos = 0;
      let reintento: ReturnType<typeof setTimeout> | undefined;

      const expirar = () => {
        if (cerrado) return;
        cerrado = true;
        if (this.session.token() === token) this.session.clear();
        void this.router.navigate(["/login"], { queryParams: { sesion: "expirada" } });
        subscriber.error(new Error("La sesión expiró o cambió. Vuelve a iniciar sesión."));
        abort.abort();
      };
      const permitido = () => {
        if (this.session.token() !== token || !this.session.valid()) { expirar(); return false; }
        return !cerrado;
      };
      const recibir = (bloque: string) => {
        if (!permitido()) return;
        const lineas = bloque.split(/\r?\n/);
        const tipo = lineas.find(l => l.startsWith("event:"))?.slice(6).trim() ?? "message";
        const datos = lineas.filter(l => l.startsWith("data:")).map(l => l.slice(5).replace(/^ /, "")).join("\n");
        if (tipo === "sesion-expirada") { expirar(); return; }
        if (tipo === "acceso-denegado") {
          cerrado = true; subscriber.next({ tipo: "sin-acceso" }); subscriber.complete(); abort.abort(); return;
        }
        if (tipo === "conectado") {
          intentos = 0; subscriber.next({ tipo: "conectado" });
        } else if (tipo === "mensaje") {
          const mensaje = JSON.parse(datos) as Mensaje;
          if (String(mensaje.grupoId) !== grupoId || !Number.isSafeInteger(Number(mensaje.idMensaje))
              || Number(mensaje.idMensaje) <= 0 || typeof mensaje.contenido !== "string" || typeof mensaje.fechaHora !== "string"
              || !Number.isFinite(Date.parse(mensaje.fechaHora))) {
            throw new Error("Mensaje de chat inválido.");
          }
          subscriber.next({ tipo: "mensaje", mensaje });
        }
      };
      const abrir = async () => {
        if (!permitido()) return;
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        try {
          const response = await fetch(environment.apiURL + "/grupo/" + encodeURIComponent(grupoId) + "/mensajes/stream", {
            headers: { Authorization: "Bearer " + token, Accept: "text/event-stream" },
            signal: abort.signal, cache: "no-store",
          });
          if (response.status === 401) { expirar(); return; }
          if (response.status === 403) {
            cerrado = true; subscriber.next({ tipo: "sin-acceso" }); subscriber.complete(); return;
          }
          if (!response.ok || !response.body || !response.headers.get("Content-Type")?.includes("text/event-stream")) {
            throw new Error("No se pudo abrir el chat.");
          }
          reader = response.body.getReader();
          const decoder = new TextDecoder();
          let pendiente = "";
          while (!cerrado) {
            const chunk = await reader.read();
            if (chunk.done) break;
            pendiente += decoder.decode(chunk.value, { stream: true });
            let separador: RegExpExecArray | null;
            while ((separador = /\r?\n\r?\n/.exec(pendiente)) !== null && !cerrado) {
              const bloque = pendiente.slice(0, separador.index);
              pendiente = pendiente.slice(separador.index + separador[0].length);
              recibir(bloque);
            }
            if (pendiente.length > 1000000) throw new Error("El evento de chat excede el tamaño permitido.");
          }
        } catch {
          // La reconexión recupera el historial; un corte no borra el borrador ni la sesión.
        } finally {
          if (reader) { try { await reader.cancel(); } catch { /* Conexión ya cerrada. */ } }
        }
        if (!cerrado && permitido()) {
          subscriber.next({ tipo: "reconectando" });
          reintento = setTimeout(() => { void abrir(); }, Math.min(1000 * 2 ** intentos++, 10000));
        }
      };
      void abrir();
      return () => {
        cerrado = true;
        if (reintento) clearTimeout(reintento);
        abort.abort();
      };
    });
  }
}
