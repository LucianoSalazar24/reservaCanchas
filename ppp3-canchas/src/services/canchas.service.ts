import api from "./api";
import type { Cancha, EstadoCancha, ChatRespuesta, ChatHistorialItem } from '@/types'

export const CanchasService = {
  async obtenerTodas(): Promise<Cancha[]> {
    const { data } = await api.get("/canchas");
    return data;
  },

  async chat(
    lat: number,
    lng: number,
    mensaje: string,
    historial: ChatHistorialItem[] = [],
  ): Promise<ChatRespuesta> {
    const { data } = await api.post("/canchas/chat", { lat, lng, mensaje, historial });
    return data;
  },

  async obtenerPorId(id: number): Promise<Cancha> {
    const { data } = await api.get(`/canchas/${id}`);
    return data;
  },

  async crear(datos: Partial<Cancha>): Promise<Cancha> {
    const { data } = await api.post("/canchas", datos);
    return data;
  },

  async actualizar(id: number, datos: Partial<Cancha>): Promise<Cancha> {
    const { data } = await api.put(`/canchas/${id}`, datos);
    return data;
  },

  async cambiarEstado(id: number, estado: EstadoCancha): Promise<Cancha> {
    const { data } = await api.patch(`/canchas/${id}`, { estado });
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/canchas/${id}`);
  },
};
