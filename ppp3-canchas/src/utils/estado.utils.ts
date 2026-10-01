import { ESTADOS_RESERVA, ESTADOS_CANCHA } from "@/mock";
import type { EstadoReserva, EstadoCancha } from "@/types";

const FALLBACK = {
  outerCls: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
  dotCls: "bg-slate-400",
};

export const EstadoUtils = {
  reserva(estado: EstadoReserva) {
    return ESTADOS_RESERVA[estado] ?? { label: estado, ...FALLBACK };
  },
  cancha(estado: EstadoCancha) {
    return ESTADOS_CANCHA[estado] ?? { label: estado, ...FALLBACK };
  },
  puedeCanselar(estado: EstadoReserva): boolean {
    return estado === "pendiente" || estado === "confirmada";
  },
};
