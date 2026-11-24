import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

export interface DatosDialogoConfirmacion {
  title: string;
  message: string;
  confirmLabel: string;
  requiredText?: string;
  danger?: boolean;
}

@Component({
  selector: "app-dialogo-confirmacion",
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./dialogo-confirmacion.component.html",
  styleUrl: "./dialogo-confirmacion.component.css",
})
export class DialogoConfirmacionComponent {
  readonly data = inject<DatosDialogoConfirmacion>(MAT_DIALOG_DATA);
  readonly text = signal("");
}
