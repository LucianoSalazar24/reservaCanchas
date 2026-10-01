import { EmptyState } from '@/components/molecules'
import { SkeletonTableRows } from '@/components/atoms'
import { ADMIN_RESERVAS_HEADERS } from '@/mock'
import type { Reserva } from '@/types'
import { Table, type AccionItem } from './table'

export type { AccionItem }

export const AdminReservationsTable = ({
  reservas,
  loading,
  error,
  ordenFecha,
  onOrdenFecha,
  getAcciones,
}: {
  reservas: Reserva[]
  loading: boolean
  error: string
  ordenFecha: 'desc' | 'asc'
  onOrdenFecha: () => void
  getAcciones: (r: Reserva) => AccionItem[]
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
        <table className="w-full border-collapse bg-white text-[13.5px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {ADMIN_RESERVAS_HEADERS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows rows={6} cols={ADMIN_RESERVAS_HEADERS.length} />
          </tbody>
        </table>
      </div>
    )
  }

  if (!error && !reservas?.length) {
    return <EmptyState titulo="No se encontraron reservas" variant="inline" />
  }

  return !!reservas?.length && (
    <Table
      reservas={reservas}
      ordenFecha={ordenFecha}
      onOrdenFecha={onOrdenFecha}
      getAcciones={getAcciones}
    />
  )
}
