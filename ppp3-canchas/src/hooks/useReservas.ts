import type { Reserva } from '@/types'
import { ReservasService } from '@/services'
import { useFetch } from './useFetch'

export function useReservas(params: Record<string, string> = {}) {
  const key = JSON.stringify(params)
  const { data, loading, error, setData, recargar } = useFetch<Reserva[]>(
    () => ReservasService.obtenerTodas(params),
    key
  )
  return {
    reservas: data ?? [],
    loading,
    error,
    recargar,
    setReservas: setData,
  }
}
