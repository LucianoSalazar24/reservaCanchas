export const ESTADOS_RESERVA: Record<
  string,
  { label: string; outerCls: string; dotCls: string }
> = {
  pendiente: {
    label: "Pendiente",
    outerCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
    dotCls: "bg-amber-500",
  },
  confirmada: {
    label: "Confirmada",
    outerCls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    dotCls: "bg-emerald-500",
  },
  cancelada: {
    label: "Cancelada",
    outerCls: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
    dotCls: "bg-red-500",
  },
  completada: {
    label: "Completada",
    outerCls: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60",
    dotCls: "bg-sky-500",
  },
  no_show: {
    label: "No Show",
    outerCls: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
    dotCls: "bg-slate-400",
  },
};

export const ESTADOS_CANCHA: Record<
  string,
  { label: string; outerCls: string; dotCls: string }
> = {
  disponible: {
    label: "Disponible",
    outerCls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    dotCls: "bg-emerald-500",
  },
  mantenimiento: {
    label: "Mantenimiento",
    outerCls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
    dotCls: "bg-amber-500",
  },
  fuera_servicio: {
    label: "Fuera servicio",
    outerCls: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
    dotCls: "bg-red-500",
  },
};

export const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia"] as const;

export const HORARIOS_DISPONIBLES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];
