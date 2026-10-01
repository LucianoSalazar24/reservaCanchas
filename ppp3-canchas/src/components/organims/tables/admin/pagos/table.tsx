import { MoneyUtils } from '@/utils'
import { METODO_ICON, METODO_COLOR, TIPO_COLOR, TIPO_LABEL } from '@/mock'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/atoms'
import { BsThreeDotsVertical } from 'react-icons/bs'
import type { Pago } from '@/types'

function parseFecha(iso: string) {
  const d = new Date(iso)
  return {
    fecha: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

const HEADERS = ['Fecha', 'Hora', 'Reserva', 'Tipo', 'Método', 'Monto', 'Observaciones']

export const Table = ({
  pagos,
  onRegistrarSaldo,
}: {
  pagos: Pago[]
  onRegistrarSaldo: (pago: Pago) => void
}) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
    <table className="w-full border-collapse bg-white text-[13.5px]">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="px-4 py-3" style={{ width: 40 }} />
          {HEADERS.map(h => (
            <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pagos.map(p => {
          const MetodoIcon = METODO_ICON[p.metodoPago]
          const { fecha, hora } = parseFecha(p.fechaPago)
          const tieneSaldo = p.tipoPago === 'seña'
          return (
            <tr key={p.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 align-middle">
                {tieneSaldo ? (
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
                      <DropdownMenuItem onSelect={() => onRegistrarSaldo(p)}>
                        Registrar saldo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span />
                )}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 whitespace-nowrap">
                {fecha}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 text-[12px] whitespace-nowrap">
                {hora}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-600 text-[12px]">
                #{p.reservaId}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11.5px] font-semibold rounded-full ring-1 ${TIPO_COLOR[p.tipoPago]}`}>
                  {TIPO_LABEL[p.tipoPago]}
                </span>
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11.5px] font-semibold rounded-full ring-1 ${METODO_COLOR[p.metodoPago]}`}>
                  <MetodoIcon size={11} />
                  {p.metodoPago.charAt(0).toUpperCase() + p.metodoPago.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 font-semibold text-brand-700 whitespace-nowrap">
                {MoneyUtils.formatear(+p.monto)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-400 text-[12px] max-w-45 truncate">
                {p.observaciones || '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)
