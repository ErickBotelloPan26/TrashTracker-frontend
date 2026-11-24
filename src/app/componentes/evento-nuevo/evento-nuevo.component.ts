import { MatSelectModule } from "@angular/material/select";
import {
  MatDatepickerModule,
  MatDatepickerIntl,
} from "@angular/material/datepicker";
import { MaterialDatepickerIntl } from "../../services/material-datepicker-intl";
import { provideNativeDateAdapter } from "@angular/material/core";
import { formatDate } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ApplicationService } from "../../services/application-service";
import { apiError } from "../../services/api-error";
import { finalize } from "rxjs";
@Component({
  selector: "app-evento-nuevo",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MatDatepickerIntl, useClass: MaterialDatepickerIntl },
  ],
  templateUrl: "./evento-nuevo.component.html",
  styleUrl: "./evento-nuevo.component.css",
})
export class EventoNuevoComponent {
  store: ApplicationService = inject(ApplicationService);
  fb: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  form: FormGroup;
  readonly error = signal("");
  readonly busy = signal(false);
  readonly groups = computed(() =>
    this.store.groups().filter((g) => this.store.canOrganize(g.id)),
  );
  readonly minDate = new Date(new Date().setHours(0, 0, 0, 0));
  constructor() {
    this.form = this.fb.group({
      groupId: [this.groups()[0]?.id ?? "", Validators.required],
      date: [null, Validators.required],
      time: ["", [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      address: ["", [Validators.required, Validators.pattern(/.*\S.*/)]],
    });
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    const v = this.form.value;
    if (v.date < this.minDate) {
      this.error.set("Selecciona una fecha actual o futura.");
      return;
    }
    this.busy.set(true);
    this.store
      .createEvent(
        v.groupId,
        formatDate(v.date, "yyyy-MM-dd", "en-US"),
        v.time,
        v.address.trim(),
      )
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (e) => {
          void this.router.navigate(["/app/eventos", e.id], {
            queryParams: { creado: "1" },
          });
        },
        error: (e) => this.error.set(apiError(e)),
      });
  }
}
