import { EmptyState } from '@/components/molecules'
import { SkeletonTableRows } from '@/components/atoms'
import { PAGOS_HEADERS } from '@/mock'
import type { Pago } from '@/types'
import { Table } from './table'

export const PagosTable = ({
  pagos,
  loading,
  error,
  onRegistrarSaldo,
}: {
  pagos: Pago[]
  loading: boolean
  error: string
  onRegistrarSaldo: (pago: Pago) => void
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
        <table className="w-full border-collapse bg-white text-[13.5px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3" style={{ width: 40 }} />
              {PAGOS_HEADERS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SkeletonTableRows rows={7} cols={PAGOS_HEADERS.length + 1} />
          </tbody>
        </table>
      </div>
    )
  }

  if (!error && !pagos?.length) {
    return <EmptyState titulo="No se encontraron pagos" variant="inline" />
  }

  return !!pagos?.length && <Table pagos={pagos} onRegistrarSaldo={onRegistrarSaldo} />
}
