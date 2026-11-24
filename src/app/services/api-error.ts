import { HttpErrorResponse } from "@angular/common/http";
export function apiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return "No se pudo conectar con la API. Comprueba que el backend esté ejecutándose en el puerto 8088.";
    const body = error.error;
    return (
      (typeof body === "string" && body.length < 400
        ? body
        : body?.mensaje || body?.message || body?.error) ||
      "No se pudo completar la operación (" + error.status + ")."
    );
  }
  return error instanceof Error
    ? error.message
    : "No se pudo completar la operación.";
}
