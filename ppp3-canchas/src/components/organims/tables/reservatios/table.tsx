import { BadgeReserva, Skeleton, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/atoms";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Reserva, SaldoReserva } from "@/types";
import { DateUtils, MoneyUtils, EstadoUtils } from "@/utils";

interface AccionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function DotsMenu({ acciones }: { acciones: AccionItem[] }) {
  if (acciones.length === 0) return <span />;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Acciones"
        >
          <BsThreeDotsVertical size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {acciones?.map((item) => (
          <DropdownMenuItem key={item.label} variant={item.variant} onSelect={item.onClick}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Table = ({
  reservas,
  canceled,
  handleSubmit,
  onPagar,
  saldos,
  saldosLoading,
  ordenFecha,
  onOrdenFecha,
}: {
  reservas: Reserva[];
  canceled: number | null;
  handleSubmit: (id: number) => void;
  onPagar: (reserva: Reserva) => void;
  saldos: Record<number, SaldoReserva>;
  saldosLoading: boolean;
  ordenFecha: "asc" | "desc";
  onOrdenFecha: () => void;
}) => {
  const puedePagar = (estado: Reserva["estado"]) =>
    estado === "pendiente" || estado === "confirmada";

  function getAcciones(r: Reserva): AccionItem[] {
    const acciones: AccionItem[] = [];
    if (puedePagar(r.estado)) {
      acciones.push({ label: "Pagar", onClick: () => onPagar(r) });
    }
    if (EstadoUtils.puedeCanselar(r.estado)) {
      acciones.push({
        label: canceled === r.id ? "Cancelando…" : "Cancelar",
        onClick: () => handleSubmit(r.id),
        variant: "danger",
      });
    }
    return acciones;
  }

  return (
    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3" style={{ width: 40 }} />
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
              <button
                onClick={onOrdenFecha}
                className="flex items-center gap-1 font-bold text-inherit hover:text-brand-700 transition-colors bg-transparent border-none cursor-pointer p-0 uppercase tracking-[0.08em] text-[11px]"
              >
                Fecha
                <span className="text-slate-400 text-[11px]">{ordenFecha === "desc" ? "↓" : "↑"}</span>
              </button>
            </th>
            {["Horario", "Cancha", "Estado", "Total", "Seña", "Abonado", "Falta"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservas?.map((r) => {
            const s = saldos[r.id];
            return (
              <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
                <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle">
                  <DotsMenu acciones={getAcciones(r)} />
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-medium">
                  {DateUtils.formatearFecha(r.fecha)}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-mono text-[13px]">
                  {DateUtils.formatearHora(r.horaInicio)} – {DateUtils.formatearHora(r.horaFin)}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                  {r.canchaNombre ?? `Cancha #${r.canchaId}`}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle">
                  <BadgeReserva estado={r.estado} />
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold text-brand-700">
                  {MoneyUtils.formatear(r.precioTotal)}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                  {MoneyUtils.formatear(r.senaRequerida ?? 0)}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold text-emerald-700">
                  {saldosLoading && !s
                    ? <Skeleton className="h-4 w-16" />
                    : s ? MoneyUtils.formatear(s.totalPagado) : "—"}
                </td>
                <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle font-semibold">
                  {saldosLoading && !s ? (
                    <Skeleton className="h-4 w-16" />
                  ) : s && s.saldoPendiente != null ? (
                    s.saldoPendiente <= 0 ? (
                      <span className="text-emerald-700">Pagado</span>
                    ) : (
                      <span className="text-amber-700">
                        {MoneyUtils.formatear(s.saldoPendiente)}
                      </span>
                    )
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
