import type { Reserva } from '@/types'
import { SkeletonTableRows } from '@/components/atoms'
import { DASHBOARD_HEADERS } from '@/mock'
import { Table } from './table'

export const DashboardReservationsTable = ({
  reservas,
  loading = false,
}: {
  reservas: Reserva[]
  loading?: boolean
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
        <table className="w-full border-collapse bg-white text-[13.5px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {DASHBOARD_HEADERS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows rows={4} cols={DASHBOARD_HEADERS.length} />
          </tbody>
        </table>
      </div>
    )
  }

  if (!reservas?.length) {
    return (
      <div
        className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200/80"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        Sin reservas para hoy
      </div>
    )
  }

  return <Table reservas={reservas} />
}
