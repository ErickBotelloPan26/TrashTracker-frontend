import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { apiError } from "../../services/api-error";
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
  selector: "app-logros",
  standalone: true,
  imports: [MatButtonToggleModule, MatButtonModule, MatCardModule, RouterLink],
  templateUrl: "./logros.component.html",
  styleUrl: "./logros.component.css",
})
export class LogrosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly refreshing = signal(false);
  ngOnInit(): void { this.refresh(); }
  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.store.achievementsSyncError.set("");
    this.store.refreshAchievements(true)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.refreshing.set(false)))
      .subscribe({ error: e => this.store.achievementsSyncError.set(apiError(e)) });
  }
  readonly store = inject(ApplicationService);
  readonly filter = signal("all");
  readonly filtered = computed(() =>
    this.store
      .achievements()
      .filter(
        (a) =>
          this.filter() === "all" ||
          (this.filter() === "unlocked" ? a.unlocked : !a.unlocked),
      ),
  );
}
