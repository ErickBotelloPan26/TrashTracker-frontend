import { Injectable } from "@angular/core";
import { MatDatepickerIntl } from "@angular/material/datepicker";

@Injectable()
export class MaterialDatepickerIntl extends MatDatepickerIntl {
  override calendarLabel = "Calendario";
  override openCalendarLabel = "Abrir calendario";
  override closeCalendarLabel = "Cerrar calendario";
  override prevMonthLabel = "Mes anterior";
  override nextMonthLabel = "Mes siguiente";
  override prevYearLabel = "Año anterior";
  override nextYearLabel = "Año siguiente";
  override prevMultiYearLabel = "Años anteriores";
  override nextMultiYearLabel = "Años siguientes";
  override switchToMonthViewLabel = "Elegir fecha";
  override switchToMultiYearViewLabel = "Elegir mes y año";
}
