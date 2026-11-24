import { registerLocaleData } from "@angular/common";
import localeEsPe from "@angular/common/locales/es-PE";
import { LOCALE_ID } from "@angular/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { MaterialPaginatorIntl } from "./services/material-paginator-intl";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { loginInterceptor } from "./interceptor/login-interceptor";
import { ApplicationConfig } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { routes } from "./app.routes";
registerLocaleData(localeEsPe);
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: "es-PE" },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline", subscriptSizing: "dynamic" },
    },
    { provide: MatPaginatorIntl, useClass: MaterialPaginatorIntl },
    provideHttpClient(withInterceptors([loginInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: "enabled",
        scrollPositionRestoration: "enabled",
      }),
    ),
  ],
};
