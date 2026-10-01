import type { Cliente } from "@/types";
import { EmptyState } from "@/components/molecules";
import { SkeletonTableRows } from "@/components/atoms";
import { CLIENTES_HEADERS } from "@/mock";
import { Table } from "./table";

export const ClientsTable = ({
  loading,
  error,
  clientes,
  onEditar,
  onEliminar,
}: {
  clientes: Cliente[];
  loading: boolean;
  error: string;
  onEditar: (cliente: Cliente) => void;
  onEliminar: (cliente: Cliente) => void;
}) => {
  if (loading) {
    return (
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
        <table className="w-full border-collapse bg-white text-[13.5px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {CLIENTES_HEADERS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows rows={6} cols={CLIENTES_HEADERS.length} />
          </tbody>
        </table>
      </div>
    );
  }

  if (!error && !clientes?.length) {
    return <EmptyState titulo="No se encontraron clientes" variant="inline" />;
  }

  return (
    !!clientes?.length && (
      <Table clientes={clientes} onEditar={onEditar} onEliminar={onEliminar} />
    )
  );
};
