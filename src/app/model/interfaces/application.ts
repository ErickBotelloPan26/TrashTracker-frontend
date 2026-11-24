export type Coordinates = [number, number];
export type ReportState = "active" | "progress" | "resolved";
export type WasteType =
  | "Plásticos y envases"
  | "Orgánicos"
  | "Residuos electrónicos"
  | "Desmonte"
  | "Otros";
export interface CitizenProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  district: string;
  avatar: string;
}
export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  waste: string;
  district: string;
  address: string;
  coordinates: Coordinates;
  state: ReportState;
  authorId: string;
  authorName: string;
  createdAt: string;
  photo: string;
}
export type GroupRole =
  | "administrador"
  | "miembro"
  | "moderador"
  | "organizador";
export interface GroupMember {
  userId: string;
  name: string;
  role: GroupRole;
}
export interface GroupMessage {
  id: string;
  authorId: string;
  author: string;
  text: string;
  createdAt: string;
}
export interface CommunityGroup {
  id: string;
  name: string;
  district: string;
  description: string;
  image: string;
  coordinates: Coordinates;
  totalMembers?: number;
  members: GroupMember[];
  messages: GroupMessage[];
}
export interface EventPhoto {
  id: string;
  authorId: string;
  url: string;
  caption: string;
}
export interface CleanupEvent {
  id: string;
  title: string;
  description: string;
  groupId: string;
  organizerId?: string;
  startsAt: string;
  startTime?: string;
  endsAt: string;
  address: string;
  district: string;
  attendees: string[];
  image: string;
  totalAttendees?: number;
  photos: EventPhoto[];
}
export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  icon: string;
}
export interface PointMovement {
  id: string;
  concept: string;
  points: number;
  createdAt: string;
}
export interface Redemption {
  state?: string;
  id: string;
  rewardId: string;
  rewardName: string;
  points: number;
  createdAt: string;
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
export interface ReportConfirmation {
  id: string;
  reportId: string;
  eventId?: string;
  text: string;
  createdAt: string;
}
export const WASTE_TYPES: readonly WasteType[] = [
  "Plásticos y envases",
  "Orgánicos",
  "Residuos electrónicos",
  "Desmonte",
  "Otros",
];
export const STATE_LABELS: Record<ReportState, string> = {
  active: "Activo",
  progress: "En proceso",
  resolved: "Resuelto",
};
