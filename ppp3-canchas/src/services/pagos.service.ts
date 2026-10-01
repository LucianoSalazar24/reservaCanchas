import api from './api'
import type { MetodoPago, TipoPago, Pago, SaldoReserva } from '@/types'

export type { MetodoPago, TipoPago }

export const PagosService = {
  async obtenerTodos(params: { tipoPago?: string; metodoPago?: string; limite?: number } = {}): Promise<Pago[]> {
    const { data } = await api.get('/pagos', { params })
    return data.data ?? data
  },

  async registrar(
    reservaId: number,
    monto: number,
    metodoPago: MetodoPago,
    tipoPago: TipoPago = 'seña',
  ) {
    const { data } = await api.post('/pagos', {
      reservaId,
      monto,
      tipoPago,
      metodoPago,
    })
    return data.data ?? data
  },

  async obtenerPorReserva(reservaId: number): Promise<SaldoReserva> {
    const { data } = await api.get('/pagos', { params: { reservaId } })
    return data.data ?? data
  },

  async obtenerEstadisticas(): Promise<{
    mes: string
    totalMes: number
    porMetodo: { cantidad: string; total: string; metodoPago: string }[]
  }> {
    const { data } = await api.get('/pagos/estadisticas')
    return data.data ?? data
  },
}
