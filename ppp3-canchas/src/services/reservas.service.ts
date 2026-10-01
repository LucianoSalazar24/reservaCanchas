import api from "./api";
import type { Reserva, SlotOcupado, ReservasInsights } from '@/types'

export const ReservasService = {
  async obtenerTodas(params: Record<string, string> = {}): Promise<Reserva[]> {
    const { data } = await api.get("/reservas", { params });
    return data;
  },

  async obtenerInsights(semanas = 6): Promise<ReservasInsights> {
    const { data } = await api.get("/reservas/insights", { params: { semanas } });
    return data;
  },

  async obtenerPorId(id: number): Promise<Reserva> {
    const { data } = await api.get(`/reservas/${id}`);
    return data;
  },

  async verificarDisponibilidad(
    fecha: string,
    canchaId: number,
  ): Promise<SlotOcupado[]> {
    const { data } = await api.get("/disponibilidad", {
      params: { fecha, canchaId: String(canchaId) },
    });
    return data.ocupados ?? [];
  },

  async crear(datos: Partial<Reserva>): Promise<Reserva> {
    const { data } = await api.post("/reservas", datos);
    return data;
  },

  async actualizarEstado(
    id: number,
    estado: string,
    extra: Record<string, unknown> = {},
  ): Promise<Reserva> {
    const { data } = await api.patch(`/reservas/${id}`, { estado, ...extra });
    return data;
  },

  async cancelar(id: number, razon = ""): Promise<Reserva> {
    return this.actualizarEstado(id, "cancelada", { razonCancelacion: razon });
  },
};
