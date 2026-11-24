import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class SessionService {
  private readonly tokenKey = "token";
  private readonly roleKey = "rol";
  private readonly rolesKey = "roles";
  private readonly legacyKey = "trashtracker.jwt";

  token(): string {
    return sessionStorage.getItem(this.tokenKey) ??
      localStorage.getItem(this.tokenKey) ??
      sessionStorage.getItem(this.legacyKey) ??
      localStorage.getItem(this.legacyKey) ?? "";
  }

  role(): string {
    const storage = this.storage();
    return storage.getItem(this.roleKey) ?? "";
  }

  save(token: string, remember: boolean, roles: string[] = []): void {
    this.clear();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    storage.setItem(this.roleKey, roles[0] ?? "");
    storage.setItem(this.rolesKey, JSON.stringify(roles));
  }

  updateRole(role: string): void {
    if (!this.token() || !role.trim()) return;
    // Restaura el rol con el perfil obtenido de la API al recargar la página.
    const normalized = "ROLE_" + role.trim().toUpperCase().replace(/^ROLE_/, "");
    this.storage().setItem(this.roleKey, normalized);
  }

  private storage(): Storage {
    return sessionStorage.getItem(this.tokenKey) !== null ||
      sessionStorage.getItem(this.legacyKey) !== null ? sessionStorage : localStorage;
  }

  clear(): void {
    for (const storage of [sessionStorage, localStorage]) {
      for (const key of [this.tokenKey, this.roleKey, this.rolesKey, this.legacyKey]) {
        storage.removeItem(key);
      }
    }
  }

  valid(): boolean {
    try {
      const payload = JSON.parse(atob(
        this.token().split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
      ));
      return Number(payload.exp) * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
