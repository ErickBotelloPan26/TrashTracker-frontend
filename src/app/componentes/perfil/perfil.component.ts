import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DialogoConfirmacionComponent } from "../dialogo-confirmacion/dialogo-confirmacion.component";
import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EstadisticasUsuario } from "../../model/estadisticas-usuario";
import { Router } from "@angular/router";
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
  selector: "app-perfil",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./perfil.component.html",
  styleUrl: "./perfil.component.css",
})
export class PerfilComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly selectedPhoto = signal<File | null>(null);
  readonly photoPreview = signal("");
  selectPhoto(event: Event): void {
    if (this.busy()) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024 || !file.size) {
      this.error.set("Selecciona una imagen JPG o PNG de hasta 10 MB.");
      input.value = "";
      return;
    }
    this.clearPhoto();
    this.selectedPhoto.set(file);
    this.photoPreview.set(URL.createObjectURL(file));
    input.value = "";
    this.error.set("");
    this.notice.set("");
  }
  clearPhoto(): void {
    if (this.photoPreview()) URL.revokeObjectURL(this.photoPreview());
    this.photoPreview.set("");
    this.selectedPhoto.set(null);
  }
  readonly statistics = signal<EstadisticasUsuario | null>(null);
  readonly loadingStatistics = signal(false);
  readonly statisticsError = signal("");
  ngOnInit(): void { this.loadStatistics(); }
  loadStatistics(): void {
    const owner = this.store.profile().id;
    if (!owner || this.loadingStatistics()) return;
    this.loadingStatistics.set(true);
    this.statisticsError.set("");
    this.store.usuario.statistics(owner)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingStatistics.set(false)))
      .subscribe({
        next: data => {
          if (this.store.profile().id !== owner || String(data.idUsuario) !== owner) return;
          this.statistics.set(data);
          this.store.balance.set(data.puntosTotales);
          this.store.level.set(data.nivel);
        },
        error: e => this.statisticsError.set(apiError(e)),
      });
  }
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  requestAccountDeletion(): void {
    if (this.busy()) return;
    this.confirmation.set("");
    this.dialog
      .open(DialogoConfirmacionComponent, {
        panelClass: "trash-dialog",
        width: "480px",
        maxWidth: "calc(100vw - 32px)",
        data: {
          title: "Eliminar cuenta",
          message:
            "Se eliminarán tu cuenta y sus datos asociados. Esta acción es permanente.",
          confirmLabel: "Confirmar eliminación",
          requiredText: "ELIMINAR",
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) {
          this.confirmation.set("ELIMINAR");
          this.deleteAccount();
        }
      });
  }
  store: ApplicationService = inject(ApplicationService);
  fb: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  form: FormGroup;
  readonly notice = signal("");
  readonly error = signal("");
  readonly confirmation = signal("");
  readonly busy = signal(false);
  constructor() {
    this.destroyRef.onDestroy(() => this.clearPhoto());
    this.form = this.fb.group({
      name: [
        this.store.profile().name,
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      nickname: [this.store.profile().nickname, Validators.maxLength(40)],
      language: [this.store.language(), Validators.required],
    });
  }
  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.notice.set("");
    this.error.set("");
    this.busy.set(true);
    const v = this.form.value;
    this.store
      .updateProfile(v.name.trim(), v.language, (v.nickname ?? "").trim(), this.selectedPhoto())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.clearPhoto();
          this.form.patchValue({ name: this.store.profile().name, nickname: this.store.profile().nickname });
          this.notice.set("Perfil guardado.");
          this.snackBar.open("Perfil guardado.", "Cerrar", { duration: 5000 });
          this.error.set("");
        },
        error: (e) => this.error.set(apiError(e)),
      });
  }
  reset(): void {
    if (this.busy()) return;
    this.clearPhoto();
    this.form.reset({
      nickname: this.store.profile().nickname,
      name: this.store.profile().name,
      language: this.store.language(),
    });
    this.notice.set("");
    this.error.set("");
  }
  deleteAccount(): void {
    if (this.confirmation() !== "ELIMINAR" || this.busy()) return;
    this.busy.set(true);
    this.store
      .deleteAccount()
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl("/login");
        },
        error: (e) => {
          this.error.set(apiError(e));
        },
      });
  }
}
