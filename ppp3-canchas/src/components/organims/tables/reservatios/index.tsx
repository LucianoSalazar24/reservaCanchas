import { Link } from "react-router-dom";
import type { Reserva, SaldoReserva } from "@/types";
import { EmptyState } from "@/components/molecules";
import { SkeletonTableRows } from "@/components/atoms";
import { CLIENTE_RESERVAS_HEADERS } from "@/mock";
import { Table } from "./table";

export const ReservationsTable = ({
  loading,
  error,
  reservas,
  handleSubmit,
  canceled,
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
  loading: boolean;
  error: string;
  ordenFecha: "asc" | "desc";
  onOrdenFecha: () => void;
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
        <table className="w-full border-collapse bg-white text-[13.5px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3" style={{ width: 40 }} />
              {CLIENTE_RESERVAS_HEADERS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows rows={4} cols={CLIENTE_RESERVAS_HEADERS.length + 1} />
          </tbody>
        </table>
      </div>
    );
  }

  if (!error && !reservas?.length) {
    return (
      <EmptyState
        icono="📅"
        titulo="Aún no tenés reservas"
        descripcion=" Hacé tu primera reserva en segundos"
        accion={
          <Link to="/reservar" className="btn btn-primary">
            Hacer mi primera reserva
          </Link>
        }
      />
    );
  }

  return (
    !!reservas?.length && (
      <Table
        canceled={canceled}
        handleSubmit={handleSubmit}
        reservas={reservas}
        onPagar={onPagar}
        saldos={saldos}
        saldosLoading={saldosLoading}
        ordenFecha={ordenFecha}
        onOrdenFecha={onOrdenFecha}
      />
    )
  );
};
