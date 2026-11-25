import { CitizenReport, ReportState } from "../../model/interfaces/application";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { effect } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DialogoConfirmacionComponent } from "../dialogo-confirmacion/dialogo-confirmacion.component";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
import { STATE_LABELS } from "../../model/interfaces/application";
import { Component, computed, inject, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  ActivatedRoute,
} from "@angular/router";
import { DatePipe } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ApplicationService } from "../../services/application-service";
@Component({
  selector: "app-mis-reportes",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    RouterLink,
    FormsModule,
    DatePipe,
  ],
  templateUrl: "./mis-reportes.component.html",
  styleUrl: "./mis-reportes.component.css",
})
export class MisReportesComponent {
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
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  requestDelete(id: string): void {
    if (this.saving()) return;
    this.dialog
      .open(DialogoConfirmacionComponent, {
        panelClass: "trash-dialog",
        width: "480px",
        maxWidth: "calc(100vw - 32px)",
        data: {
          title: "¿Eliminar este reporte?",
          message:
            "El reporte se eliminará del servidor. Solo puedes eliminar los reportes que te pertenecen.",
          confirmLabel: "Eliminar reporte",
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) {
          this.pendingDelete.set(id);
          this.confirmDelete();
        }
      });
  }
  readonly saving = signal(false);
  readonly store = inject(ApplicationService);
  readonly state = signal("");
  readonly labels = STATE_LABELS;
  stateLabel(state: ReportState): string {
    return this.labels[state];
  }
  readonly pendingDelete = signal<string | null>(null);
  readonly notice = signal("");
  readonly filtered = computed(() =>
    this.store
      .myReports()
      .filter((r) => !this.state() || r.state === this.state()),
  );
  confirmDelete(): void {
    if (this.saving()) return;
    const id = this.pendingDelete();
    if (!id) return;
    defer(() => {
      this.saving.set(true);
      return this.store.deleteReport(id);
    })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set("Reporte eliminado.");
          this.snackBar.open("Reporte eliminado.", "Cerrar", {
            duration: 5000,
          });
          this.pendingDelete.set(null);
        },
        error: (e) => {
          this.notice.set(apiError(e));
          this.pendingDelete.set(null);
        },
      });
  }
}
