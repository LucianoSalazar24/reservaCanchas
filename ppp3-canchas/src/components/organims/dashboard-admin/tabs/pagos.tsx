import { useEffect, useState } from 'react'
import { PagosService, ReservasService } from '@/services'
import { MoneyUtils } from '@/utils'
import { Select, SelectItem, notificar } from '@/components/atoms'
import { PagosTable } from '@/components/organims/tables'
import { ModalPagoReserva } from '@/components/organims/my-reservations/ModalPagoReserva'
import type { Pago, Reserva } from '@/types'

export function PagosTab() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [reservaPago, setReservaPago] = useState<Reserva | null>(null)

  async function handleRegistrarSaldo(pago: Pago) {
    try {
      const reserva = await ReservasService.obtenerPorId(pago.reservaId)
      setReservaPago(reserva)
    } catch {
      notificar('No se pudo cargar la reserva', 'error')
    }
  }

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string> = {}
      if (filtroMetodo) params.metodoPago = filtroMetodo
      if (filtroTipo) params.tipoPago = filtroTipo
      const data = await PagosService.obtenerTodos(params)
      setPagos(data)
    } catch (err) {
      setError((err as Error).message || 'Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroMetodo, filtroTipo])

  const totalMostrado = pagos.reduce((s, p) => s + +p.monto, 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pagos</h1>
          <p className="text-slate-400 text-sm mt-1">Listado detallado de todos los pagos registrados</p>
        </div>
        {!loading && pagos.length > 0 && (
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Total mostrado</div>
            <div className="text-xl font-extrabold text-emerald-700">{MoneyUtils.formatear(totalMostrado)}</div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Método</label>
          <Select value={filtroMetodo} onValueChange={setFiltroMetodo} placeholder="Todos">
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="tarjeta">Tarjeta</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
          </Select>
        </div>
        <div>
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Tipo</label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo} placeholder="Todos">
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="seña">Seña</SelectItem>
            <SelectItem value="saldo">Saldo</SelectItem>
            <SelectItem value="completo">Completo</SelectItem>
            <SelectItem value="devolucion">Devolución</SelectItem>
          </Select>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3.5 rounded-xl flex items-start gap-3 text-[13.5px] border bg-red-50 text-red-800 border-red-200 mb-4">
          {error}
        </div>
      )}

      <PagosTable
        pagos={pagos}
        loading={loading}
        error={error}
        onRegistrarSaldo={handleRegistrarSaldo}
      />

      {reservaPago && (
        <ModalPagoReserva
          reserva={reservaPago}
          onClose={() => setReservaPago(null)}
          onPagado={() => {
            setReservaPago(null)
            notificar('Pago registrado correctamente', 'success')
            cargar()
          }}
        />
      )}
    </div>
  )
}
