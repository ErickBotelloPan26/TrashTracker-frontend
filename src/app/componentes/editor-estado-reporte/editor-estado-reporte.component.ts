import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Observable, finalize } from "rxjs";
import { ApplicationService } from "../../services/application-service";
import {
  CitizenReport,
  ReportState,
  STATE_LABELS,
} from "../../model/interfaces/application";
import { apiError } from "../../services/api-error";

@Component({
  selector: "app-editor-estado-reporte",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./editor-estado-reporte.component.html",
  styleUrl: "./editor-estado-reporte.component.css",
})
export class EditorEstadoReporteComponent implements OnChanges {
  @Input({ required: true }) report: CitizenReport;
  readonly store = inject(ApplicationService);
  readonly fb = inject(FormBuilder);
  readonly labels = STATE_LABELS;
  form: FormGroup;
  readonly saving = signal(false);
  readonly notice = signal("");
  readonly error = signal("");
  constructor() {
    this.form = this.fb.group({
      state: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(active|progress|resolved)$/),
        ],
      ],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.form.reset({ state: this.report.state }, { emitEvent: false });
    if (changes["report"]?.previousValue?.id !== this.report.id) {
      this.notice.set("");
      this.error.set("");
    }
  }
  save(): void {
    this.form.markAllAsTouched();
    if (
      !this.store.isAdmin() ||
      this.saving() ||
      this.form.invalid ||
      this.form.value.state === this.report.state
    )
      return;
    this.persist(
      this.store.updateReportState(
        this.report.id,
        this.form.value.state as ReportState,
      ),
    );
  }
  resolve(): void {
    if (
      !this.store.isAdmin() ||
      this.saving() ||
      this.report.state === "resolved"
    )
      return;
    this.persist(this.store.resolveReport(this.report.id));
  }
  private persist(request: Observable<CitizenReport>): void {
    this.saving.set(true);
    this.notice.set("");
    this.error.set("");
    this.form.disable({ emitEvent: false });
    request
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.form.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: (report) => {
          this.form.reset({ state: report.state }, { emitEvent: false });
          this.notice.set(
            "Estado guardado: " + this.labels[report.state] + ".",
          );
        },
        error: (e) => {
          this.form.reset({ state: this.report.state }, { emitEvent: false });
          this.error.set(apiError(e));
        },
      });
  }
}
