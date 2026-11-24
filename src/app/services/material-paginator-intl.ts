import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class MaterialPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = "Reportes por página:";
  override nextPageLabel = "Página siguiente";
  override previousPageLabel = "Página anterior";
  override firstPageLabel = "Primera página";
  override lastPageLabel = "Última página";
  override getRangeLabel = (
    page: number,
    size: number,
    total: number,
  ): string => {
    if (!total || !size) return `0 de ${total}`;
    const first = page * size;
    return `${first + 1}–${Math.min(first + size, total)} de ${total}`;
  };
}
