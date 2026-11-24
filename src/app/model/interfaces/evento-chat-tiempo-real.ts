import { Mensaje } from "../mensaje";

export type EventoChatTiempoReal =
  | { tipo: "conectado" | "reconectando" | "sin-acceso" }
  | { tipo: "mensaje"; mensaje: Mensaje };
