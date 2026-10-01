import { ESTADOS_RESERVA, ESTADOS_CANCHA } from "@/mock";
import type { EstadoReserva, EstadoCancha } from "@/types";

const BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-[3px] text-[11.5px] font-semibold rounded-full whitespace-nowrap";
const FALLBACK = {
  outerCls: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/60",
  dotCls: "bg-slate-400",
};

export function BadgeReserva({ estado }: { estado: EstadoReserva }) {
  const { label, outerCls, dotCls } = ESTADOS_RESERVA[estado] ?? {
    label: estado,
    ...FALLBACK,
  };
  return (
    <span className={`${BASE} ${outerCls}`}>
      <span className={`size-1.25 rounded-full flex-shrink-0 ${dotCls}`} />
      {label}
    </span>
  );
}

export function BadgeCancha({ estado }: { estado: EstadoCancha }) {
  const { label, outerCls, dotCls } = ESTADOS_CANCHA[estado] ?? {
    label: estado,
    ...FALLBACK,
  };
  return (
    <span className={`${BASE} ${outerCls}`}>
      <span className={`size-1.25  rounded-full flex-shrink-0 ${dotCls}`} />
      {label}
    </span>
  );
}
