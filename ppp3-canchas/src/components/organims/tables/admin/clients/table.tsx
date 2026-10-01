import type { Cliente, EstadoCliente } from "@/types";
import { tipoClienteLabel } from "@/mock";

const ESTADO_BADGE: Record<EstadoCliente, { dot: string; chip: string }> = {
  activo: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  },
  suspendido: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  },
  bloqueado: {
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
  },
};

export const Table = ({
  clientes,
  onEditar,
  onEliminar,
}: {
  clientes: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onEliminar: (cliente: Cliente) => void;
}) => {
  const header_table = [
    "Nombre",
    "Teléfono",
    "Email",
    "Tipo",
    "Reservas",
    "Descuento",
    "Estado",
    "",
  ];

  return (
    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {header_table?.map((label: string) => (
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientes?.map((c) => (
            <tr key={c.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.nombre} {c.apellido}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.telefono}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.email ?? "—"}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {tipoClienteLabel(c.tipoClienteId)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.totalReservas ?? 0}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {c.descuentoPorcentaje ?? 0}%
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {(() => {
                  const badge = ESTADO_BADGE[c.estado ?? "activo"];
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.75 text-[11.5px] font-semibold rounded-full whitespace-nowrap ${badge.chip}`}
                    >
                      <span className={`size-1.25 rounded-full flex-shrink-0 ${badge.dot}`} />
                      {c.estado ?? "activo"}
                    </span>
                  );
                })()}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-small btn-outline border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300"
                    onClick={() => onEditar(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-small btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => onEliminar(c)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
