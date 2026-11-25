import { CitizenReport, ReportState } from "../../model/interfaces/application";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { effect } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { ApplicationService } from "../../services/application-service";
import { apiError } from "../../services/api-error";
import { STATE_LABELS } from "../../model/interfaces/application";

@Component({
  selector: "app-administracion-reportes",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    RouterLink,
    FormsModule,
    DatePipe,
  ],
  templateUrl: "./administracion-reportes.component.html",
  styleUrl: "./administracion-reportes.component.css",
})
export class AdministracionReportesComponent {
  private ordenarReportes(
    reports: CitizenReport[],
    sort: Sort,
  ): CitizenReport[] {
    if (!sort.direction) return reports;
    const field = sort.active as keyof CitizenReport;
    return [...reports].sort((a, b) => {
      const first = String(a[field] ?? "");
      const second = String(b[field] ?? "");
      return (
        first.localeCompare(second, "es", { numeric: true }) *
        (sort.direction === "asc" ? 1 : -1)
      );
    });
  }
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly sort = signal<Sort>({ active: "", direction: "" });
  readonly tableRows = computed(() =>
    this.ordenarReportes(this.filtered(), this.sort()).slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize(),
    ),
  );
  constructor() {
    effect(() => {
      this.filtered();
      this.pageIndex.set(0);
    });
  }
  readonly store = inject(ApplicationService);
  readonly labels = STATE_LABELS;
  stateLabel(state: ReportState): string {
    return this.labels[state];
  }
  readonly query = signal("");
  readonly state = signal("");
  readonly refreshing = signal(false);
  readonly error = signal("");
  readonly failedPhotos = signal(new Set<string>());
  readonly filtered = computed(() => {
    const query = this.normalize(this.query().trim());
    return [...this.store.reports()]
      .filter(
        (r) =>
          (!this.state() || r.state === this.state()) &&
          (!query ||
            this.normalize(
              [r.id, r.title, r.description, r.authorName, r.waste].join(" "),
            ).includes(query)),
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });
  readonly counts = computed(() => ({
    all: this.store.reports().length,
    active: this.store.reports().filter((r) => r.state === "active").length,
    progress: this.store.reports().filter((r) => r.state === "progress").length,
    resolved: this.store.reports().filter((r) => r.state === "resolved").length,
  }));
  ngOnInit(): void {
    this.refresh();
  }
  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.error.set("");
    this.store
      .refreshReports()
      .pipe(finalize(() => this.refreshing.set(false)))
      .subscribe({ error: (e) => this.error.set(apiError(e)) });
  }
  photoFailed(id: string): void {
    this.failedPhotos.update((ids) => new Set([...ids, id]));
  }
  private normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
}
