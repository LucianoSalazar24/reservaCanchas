import { BadgeReserva } from '@/components/atoms'
import type { Reserva } from '@/types'
import { DateUtils, MoneyUtils } from '@/utils'

export const Table = ({ reservas }: { reservas: Reserva[] }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-(--shadow-card)">
      <table className="w-full border-collapse bg-white text-[13.5px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">Horario</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">Cancha</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">Cliente</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">Estado</th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] whitespace-nowrap">Precio</th>
          </tr>
        </thead>
        <tbody>
          {reservas?.map(r => (
            <tr key={r.id} className="hover:bg-brand-50/50 transition-colors">
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-mono text-[13px] font-semibold">
                {DateUtils.formatearHora(r.horaInicio)} – {DateUtils.formatearHora(r.horaFin)}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                {r.canchaNombre ?? `Cancha #${r.canchaId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-medium">
                {r.clienteNombre ?? `Cliente #${r.clienteId}`}
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle">
                <BadgeReserva estado={r.estado} />
              </td>
              <td className="px-4 py-3.5 border-b border-slate-100/80 text-slate-700 align-middle font-semibold text-brand-700">
                {MoneyUtils.formatear(r.precioTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
