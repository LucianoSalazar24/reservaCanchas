import type { Cancha } from '@/types'
import { CanchasService } from '@/services'
import { useFetch } from './useFetch'

export function useCanchas() {
  const { data, loading, error, setData, recargar } = useFetch<Cancha[]>(
    () => CanchasService.obtenerTodas()
  )
  return {
    canchas: data ?? [],
    loading,
    error,
    recargar,
    setCanchas: setData,
  }
}
