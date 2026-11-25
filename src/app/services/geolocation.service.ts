import { Injectable } from "@angular/core";
import { Coordinates } from "../model/interfaces/application";
@Injectable({ providedIn: "root" })
export class GeolocationService {
  current(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Tu navegador no admite geolocalización. Puedes indicar la ubicación manualmente.",
          ),
        );
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve([p.coords.latitude, p.coords.longitude]),
        () =>
          reject(
            new Error(
              "No se pudo obtener tu ubicación. Revisa el permiso o indica la ubicación manualmente.",
            ),
          ),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    });
  }
}
