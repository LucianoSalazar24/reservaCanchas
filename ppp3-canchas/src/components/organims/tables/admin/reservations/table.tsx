import { BadgeReserva, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/atoms";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Reserva } from "@/types";
import { DateUtils, MoneyUtils } from "@/utils";

export interface AccionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function DotsMenu({ acciones }: { acciones: AccionItem[] }) {
  if (acciones?.length === 0) return <span />;
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
        {acciones.map((item) => (
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
  ordenFecha,
  onOrdenFecha,
  getAcciones,
}: {
  reservas: Reserva[];
  ordenFecha: "desc" | "asc";
  onOrdenFecha: () => void;
  getAcciones: (r: Reserva) => AccionItem[];
}) => {
  const header_table = [
    "Horario inicio",
    "Horario finalización",
    "Cancha",
    "Cliente",
    "Estado",
    "Total",
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap"
              style={{ width: 40 }}
            />
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
              <button
                onClick={onOrdenFecha}
                className="flex items-center gap-1 font-semibold text-inherit hover:text-brand-700 transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                Fecha
                <span className="text-slate-400 text-[11px]">
                  {ordenFecha === "desc" ? "↓" : "↑"}
                </span>
              </button>
            </th>
            {header_table?.map((label: string) => (
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservas?.map((r) => (
            <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <DotsMenu acciones={getAcciones(r)} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearFecha(r.fecha)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearHora(r.horaInicio)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {DateUtils.formatearHora(r.horaFin)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.canchaNombre ?? `${r.canchaId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.clienteNombre ?? `Cliente #${r.clienteId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <BadgeReserva estado={r.estado} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {MoneyUtils.formatear(r.precioTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
