export type ReportStatus = "critical" | "cleanup" | "progress";
export interface ReportMarker {
  coords: [number, number];
  title: string;
  description: string;
  status: ReportStatus;
}
