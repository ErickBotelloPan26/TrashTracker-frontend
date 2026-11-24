export class Notificacion {
  idNotificacion: number;
  tipo: string;
  contenido: string;
  leido: boolean;
  fecha: string;
  usuarioId: number;
  eventoId: number | null;
}
