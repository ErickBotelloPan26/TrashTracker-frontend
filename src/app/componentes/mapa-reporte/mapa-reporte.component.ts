import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet";
import {
  CitizenReport,
  Coordinates,
  STATE_LABELS,
} from "../../model/interfaces/application";
@Component({
  selector: "app-mapa-reporte",
  standalone: true,
  templateUrl: "./mapa-reporte.component.html",
  styleUrl: "./mapa-reporte.component.css",
})
export class MapaReporteComponent {
  readonly reports = input<readonly CitizenReport[]>([]);
  readonly center = input<Coordinates | null>(null);
  readonly pickable = input(false);
  readonly pickedLocation = input<Coordinates | null>(null);
  readonly selected = output<string>();
  readonly picked = output<Coordinates>();
  readonly error = signal("");
  private readonly ready = signal(false);
  private readonly container =
    viewChild.required<ElementRef<HTMLDivElement>>("mapContainer");
  private readonly destroyRef = inject(DestroyRef);
  private map?: LeafletMap;
  private layer?: LayerGroup;
  private pin?: CircleMarker;
  private resize?: ResizeObserver;
  private leaflet?: typeof import("leaflet");
  constructor() {
    afterNextRender(() => {
      void this.initialize();
    });
    effect(() => {
      const rows = this.reports();
      if (this.ready()) untracked(() => this.render(rows));
    });
    effect(() => {
      const center = this.center();
      if (this.ready() && center) this.map?.setView(center, 14);
    });
    effect(() => {
      const location = this.pickedLocation();
      if (this.ready()) untracked(() => this.renderPin(location));
    });
    this.destroyRef.onDestroy(() => {
      this.resize?.disconnect();
      this.map?.remove();
    });
  }
  private async initialize(): Promise<void> {
    try {
      const leafletModule = await import("leaflet");
      const L = (leafletModule.default ?? leafletModule) as typeof import("leaflet");
      if (this.destroyRef.destroyed) return;
      this.leaflet = L;
      this.map = L.map(this.container().nativeElement, {
        scrollWheelZoom: false,
      }).setView(this.center() ?? [-12.0464, -77.0428], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
        .on("tileerror", () =>
          this.error.set(
            "El fondo del mapa no está disponible. Los reportes siguen accesibles en la lista.",
          ),
        )
        .addTo(this.map);
      this.layer = L.layerGroup().addTo(this.map);
      this.map.on("click", (event) => {
        if (this.pickable())
          this.picked.emit([event.latlng.lat, event.latlng.lng]);
      });
      this.resize = new ResizeObserver(() => this.map?.invalidateSize());
      this.resize.observe(this.container().nativeElement);
      this.ready.set(true);
    } catch {
      this.error.set(
        "No se pudo cargar el mapa. Puedes consultar los reportes en la lista.",
      );
    }
  }
  private render(rows: readonly CitizenReport[]): void {
    if (!this.leaflet || !this.layer) return;
    this.layer.clearLayers();
    const colors = {
      active: "#e45a64",
      progress: "#edae43",
      resolved: "#3cb878",
    };
    for (const row of rows) {
      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = row.title;
      const text = document.createElement("p");
      text.textContent =
        row.waste +
        " · " +
        STATE_LABELS[row.state] +
        " · " +
        row.authorName +
        " · " +
        new Date(row.createdAt).toLocaleString("es-PE");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Ver detalle";
      button.addEventListener("click", () => this.selected.emit(row.id));
      popup.append(title, text, button);
      this.leaflet
        .circleMarker(row.coordinates, {
          radius: 10,
          color: "white",
          weight: 2,
          fillColor: colors[row.state],
          fillOpacity: 1,
        })
        .addTo(this.layer)
        .bindPopup(popup);
    }
  }
  private renderPin(location: Coordinates | null): void {
    if (!this.leaflet || !this.map) return;
    if (this.pin) this.map.removeLayer(this.pin);
    if (location)
      this.pin = this.leaflet
        .circleMarker(location, {
          radius: 8,
          color: "#193319",
          fillColor: "#3cb878",
          fillOpacity: 1,
        })
        .addTo(this.map);
  }
}
