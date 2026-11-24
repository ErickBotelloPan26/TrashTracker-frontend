import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { ErrorStateMatcher } from "@angular/material/core";
import { Component, inject, signal } from "@angular/core";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, switchMap } from "rxjs";
import { LoginService } from "../../services/login-service";
import { RequestDto } from "../../model/request-dto";
import { ApplicationService } from "../../services/application-service";
import { SessionService } from "../../services/session-service";
import { apiError } from "../../services/api-error";
import { EncabezadoComponent } from "../encabezado/encabezado.component";
type AuthMode = "login" | "register" | "recovery";
export function passwordsMatch(
  control: AbstractControl,
): ValidationErrors | null {
  return control.get("password")?.value === control.get("confirm")?.value
    ? null
    : { passwordMismatch: true };
}
@Component({
  selector: "app-autenticacion",
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    EncabezadoComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: "./autenticacion.component.html",
  styleUrl: "./autenticacion.component.css",
})
export class AutenticacionComponent {
  readonly emailErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control) =>
      this.duplicateEmail() || !!(control?.touched && control.invalid),
  };
  readonly confirmErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control) =>
      !!control?.touched &&
      (!!control.invalid || !!control.parent?.hasError("passwordMismatch")),
  };
  auth: LoginService = inject(LoginService);
  store: ApplicationService = inject(ApplicationService);
  session: SessionService = inject(SessionService);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  builder: FormBuilder = inject(FormBuilder);
  form: FormGroup;
  readonly mode = signal<AuthMode>("login");
  readonly recoveryPreview = signal(false);
  readonly duplicateEmail = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly notice = signal("");
  readonly busy = signal(false);
  readonly resetToken = signal("");
  readonly resetDone = signal(false);
  get subtitle(): string {
    return this.mode() === "register"
      ? "Únete a la comunidad y empieza a reportar."
      : this.mode() === "recovery"
        ? this.resetToken()
          ? "Ingresa tu nueva contraseña."
          : "Ingresa tu correo para recuperar tu cuenta."
        : "Inicia sesión para acceder a tu cuenta";
  }
  constructor() {
    this.form = this.builder.group({
      name: [""],
      email: [""],
      password: [""],
      confirm: [""],
      remember: [false],
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((query) => {
      this.resetToken.set(query.get("token") ?? "");
      this.configure();
      if (query.has("conexion"))
        this.notice.set(
          this.store.error() ||
            "No se pudo cargar tu cuenta. Vuelve a intentar iniciar sesión.",
        );
      if (query.has("registrado"))
        this.notice.set(
          "Cuenta creada. Inicia sesión con tu correo y contraseña.",
        );
      if (query.has("sesion"))
        this.notice.set("Tu sesión expiró. Inicia sesión de nuevo.");
    });
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.mode.set(data["mode"]);
      this.form.reset();
      this.notice.set(
        this.route.snapshot.queryParamMap.has("registrado")
          ? "Cuenta creada. Inicia sesión con tu correo y contraseña."
          : this.notice(),
      );
      this.resetDone.set(false);
      this.recoveryPreview.set(false);
      this.configure();
    });
  }
  private configure(): void {
    const register = this.mode() === "register",
      reset = this.mode() === "recovery" && !!this.resetToken();
    this.form
      .get("name")!
      .setValidators(
        register ? [Validators.required, Validators.pattern(/.*\S.*/)] : [],
      );
    this.form
      .get("email")!
      .setValidators(reset ? [] : [Validators.required, Validators.email]);
    this.form
      .get("password")!
      .setValidators(
        register || reset
          ? [Validators.required, Validators.minLength(reset ? 12 : 8)]
          : this.mode() === "login"
            ? [Validators.required]
            : [],
      );
    this.form
      .get("confirm")!
      .setValidators(register || reset ? [Validators.required] : []);
    this.form.setValidators(register || reset ? passwordsMatch : null);
    Object.values(this.form.controls).forEach((c) =>
      c.updateValueAndValidity({ emitEvent: false }),
    );
    this.form.updateValueAndValidity({ emitEvent: false });
  }
  invalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.touched && c.invalid;
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.notice.set("");
    this.duplicateEmail.set(false);
    const v = this.form.value;
    if (this.mode() === "recovery") {
      if (this.resetToken()) {
        this.auth
          .reset(this.resetToken(), v.password)
          .pipe(finalize(() => this.busy.set(false)))
          .subscribe({
            next: () => {
              this.store.clear();
              this.resetDone.set(true);
              this.recoveryPreview.set(true);
              this.notice.set(
                "Contraseña actualizada. Ya puedes iniciar sesión.",
              );
            },
            error: (e) => this.notice.set(apiError(e)),
          });
      } else
        this.auth
          .recover(v.email.trim())
          .pipe(finalize(() => this.busy.set(false)))
          .subscribe({
            next: (data) => {
              this.notice.set(data.mensaje);
              this.recoveryPreview.set(true);
            },
            error: (e) => this.notice.set(apiError(e)),
          });
      return;
    }
    if (this.mode() === "register") {
      this.auth
        .register(v.name.trim(), v.email.trim(), v.password)
        .pipe(finalize(() => this.busy.set(false)))
        .subscribe({
          next: () => {
            void this.router.navigate(["/login"], {
              queryParams: { registrado: "1" },
            });
          },
          error: (e) => {
            this.duplicateEmail.set(e.status === 409);
            this.notice.set(apiError(e));
          },
        });
      return;
    }
    const requestDto = new RequestDto();
    requestDto.correo = v.email.trim();
    requestDto.contrasena = v.password;
    this.auth
      .login(requestDto, !!v.remember)
      .pipe(
        switchMap(() => this.store.load()),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl("/app/inicio");
        },
        error: (e) => {
          this.notice.set(apiError(e));
          this.store.clear();
        },
      });
  }
}
