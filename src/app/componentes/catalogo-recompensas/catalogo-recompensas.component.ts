import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DialogoConfirmacionComponent } from "../dialogo-confirmacion/dialogo-confirmacion.component";
import { defer } from "rxjs";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
import { Reward } from "../../model/interfaces/application";
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
  selector: "app-catalogo-recompensas",
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    DatePipe,
    RouterLink,
  ],
  templateUrl: "./catalogo-recompensas.component.html",
  styleUrl: "./catalogo-recompensas.component.css",
})
export class CatalogoRecompensasComponent {
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  requestRedemption(reward: Reward): void {
    if (this.saving() || this.store.balance() < reward.cost || reward.stock < 1)
      return;
    this.dialog
      .open(DialogoConfirmacionComponent, {
        panelClass: "trash-dialog",
        width: "480px",
        maxWidth: "calc(100vw - 32px)",
        data: {
          title: "Confirmar canje",
          message:
            "Canjearás " +
            reward.name +
            " por " +
            reward.cost +
            " EcoPuntos. Tu saldo quedará en " +
            (this.store.balance() - reward.cost) +
            " puntos.",
          confirmLabel: "Confirmar canje",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) {
          this.pending.set(reward);
          this.confirm();
        }
      });
  }
  readonly saving = signal(false);
  readonly store = inject(ApplicationService);
  readonly pending = signal<Reward | null>(null);
  readonly notice = signal("");
  readonly error = signal("");
  confirm(): void {
    if (this.saving()) return;
    const reward = this.pending();
    if (!reward) return;
    this.pending.set(null);
    defer(() => {
      this.saving.set(true);
      return this.store.redeemReward(reward.id);
    })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.notice.set(
            "Canje registrado. Tu saldo y el historial se actualizaron.",
          );
          this.error.set("");
          this.snackBar.open("Canje registrado.", "Cerrar", { duration: 5000 });
        },
        error: (e) => this.error.set(apiError(e)),
      });
  }
}
