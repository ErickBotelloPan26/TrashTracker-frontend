import { environment } from "../../environments/environment";
import { Reporte } from "../model/reporte";
import { CitizenReport } from "../model/interfaces/application";
export function mediaUrl(url: string): string {
  if (!url) return "";
  const base = environment.apiURL.replace(/\/api\/?$/, "");
  if (url.startsWith("/files/")) return base + url;
  if (url.startsWith("files/")) return base + "/" + url;
  return url;
}
export function mapReport(r: Reporte): CitizenReport {
  return {
    id: String(r.idReporte),
    title:
      r.descripcion?.split("\n")[0]?.slice(0, 100) || "Reporte #" + r.idReporte,
    description: r.descripcion || "",
    waste: r.tipoResiduoNombre || "Otros",
    district: "",
    address: r.latitud + ", " + r.longitud,
    coordinates: [Number(r.latitud), Number(r.longitud)],
    state:
      r.estado === "EN_PROCESO"
        ? "progress"
        : r.estado === "LIMPIADO"
          ? "resolved"
          : "active",
    authorId: String(r.usuarioId),
    authorName: r.usuarioNombre || "",
    createdAt: r.fechaHora,
    photo: mediaUrl(r.fotoUrl),
  };
}
