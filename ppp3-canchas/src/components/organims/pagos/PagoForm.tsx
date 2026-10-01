import { useState } from 'react'
import { PagosService } from '@/services'
import { MoneyUtils } from '@/utils'
import { Select, SelectItem, notificar } from '@/components/atoms'
import type { MetodoPago, Pago, TipoPago } from '@/types'

interface Props {
  reservaId: number
  senaRequerida: number
  precioTotal: number
  /** Saldo pendiente actual (precioTotal - totalPagado). Si se omite, se asume sin pagos previos. */
  saldoPendiente?: number | null
  onPagado: (pago: Pago) => void
  /** Texto del botón de envío. */
  textoBoton?: string
}

/**
 * Formulario reutilizable para registrar un pago (simulado) de una reserva.
 * Usado tanto en el paso de pago del flujo de reserva como en el modal de "Mis Reservas".
 * El backend confirma la reserva automáticamente al cubrirse la seña.
 */
export function PagoForm({
  reservaId,
  senaRequerida,
  precioTotal,
  saldoPendiente,
  onPagado,
  textoBoton = 'Pagar (simular)',
}: Props) {
  const totalPagadoPrevio =
    saldoPendiente != null ? Math.max(precioTotal - saldoPendiente, 0) : 0
  const restante = saldoPendiente != null ? saldoPendiente : precioTotal
  const senaPendiente = Math.max(senaRequerida - totalPagadoPrevio, 0)
  const montoSugerido = senaPendiente > 0 ? senaPendiente : restante

  const [monto, setMonto] = useState(String(montoSugerido))
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [procesando, setProcesando] = useState(false)
  const [errorCampo, setErrorCampo] = useState('')

  function derivarTipoPago(valor: number): TipoPago {
    const nuevoTotal = totalPagadoPrevio + valor
    if (totalPagadoPrevio === 0 && nuevoTotal >= precioTotal) return 'completo'
    if (totalPagadoPrevio === 0) return 'seña'
    return 'saldo'
  }

  async function pagar() {
    const valor = parseFloat(monto)
    if (!valor || valor <= 0) {
      setErrorCampo('Ingresá un monto válido')
      return
    }
    if (valor > restante) {
      setErrorCampo(`El monto no puede superar el saldo pendiente (${MoneyUtils.formatear(restante)})`)
      return
    }
    setProcesando(true)
    setErrorCampo('')
    try {
      const pago = await PagosService.registrar(
        reservaId,
        valor,
        metodo,
        derivarTipoPago(valor),
      )
      onPagado(pago)
    } catch (err) {
      notificar((err as Error).message || 'Error al registrar el pago', 'error')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4 text-[13px]">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Seña requerida
          </span>
          <p className="font-semibold text-slate-800 mt-0.5">
            {MoneyUtils.formatear(senaRequerida)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Saldo pendiente
          </span>
          <p className="font-semibold text-slate-800 mt-0.5">
            {MoneyUtils.formatear(restante)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Monto a pagar
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {senaPendiente > 0 && (
            <button
              type="button"
              className="btn btn-small btn-outline"
              onClick={() => setMonto(String(senaPendiente))}
            >
              Seña: {MoneyUtils.formatear(senaPendiente)}
            </button>
          )}
          <button
            type="button"
            className="btn btn-small btn-outline"
            onClick={() => setMonto(String(restante))}
          >
            Saldo: {MoneyUtils.formatear(restante)}
          </button>
        </div>
        <input
          type="number"
          className={`form-input${parseFloat(monto) > restante ? ' border-red-400 focus:ring-red-300' : ''}`}
          min={0}
          max={restante}
          value={monto}
          onChange={(e) => {
            setMonto(e.target.value)
            setErrorCampo('')
          }}
        />
        {parseFloat(monto) > restante && (
          <p className="text-red-600 text-[12px] mt-1">
            El monto supera el saldo pendiente ({MoneyUtils.formatear(restante)})
          </p>
        )}
      </div>

      <div className="mb-5">
        <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Método de pago
        </label>
        <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)}>
          <SelectItem value="efectivo">Efectivo</SelectItem>
          <SelectItem value="tarjeta">Tarjeta</SelectItem>
          <SelectItem value="transferencia">Transferencia</SelectItem>
        </Select>
      </div>

      {errorCampo && (
        <div className="px-4 py-3 rounded-xl text-[13.5px] border bg-red-50 text-red-800 border-red-200 mb-4">
          {errorCampo}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={pagar}
        disabled={procesando}
      >
        {procesando ? 'Procesando…' : textoBoton}
      </button>
    </div>
  )
}
