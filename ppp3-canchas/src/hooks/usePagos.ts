import { useEffect, useState } from 'react'
import { PagosService } from '@/services'
import { useFetch } from './useFetch'
import type { SaldoReserva } from '@/types'

// Pagos + saldo pendiente de una reserva (GET /pagos?reservaId=).
export function usePagosReserva(reservaId: number) {
  return useFetch<SaldoReserva>(
    () => PagosService.obtenerPorReserva(reservaId),
    String(reservaId),
  )
}

// Saldo (abonado / pendiente) de varias reservas a la vez. Una consulta por reserva en paralelo.
export function useSaldosReservas(reservaIds: number[]) {
  const [saldos, setSaldos] = useState<Record<number, SaldoReserva>>({})
  const [loading, setLoading] = useState(false)
  const [trigger, setTrigger] = useState(0)
  const key = reservaIds.join(',')

  useEffect(() => {
    if (reservaIds.length === 0) {
      setSaldos({})
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all(
      reservaIds.map((id) =>
        PagosService.obtenerPorReserva(id)
          .then((s) => [id, s] as const)
          .catch(() => [id, null] as const),
      ),
    )
      .then((entries) => {
        if (cancelled) return
        const map: Record<number, SaldoReserva> = {}
        for (const [id, s] of entries) if (s) map[id] = s
        setSaldos(map)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [key, trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  return { saldos, loading, refrescar: () => setTrigger((t) => t + 1) }
}
