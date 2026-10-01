import type { Cliente } from '@/types'
import { ClientesService } from '@/services'
import { useFetch } from './useFetch'

export function useClientes(params: Record<string, string> = {}) {
  const key = JSON.stringify(params)
  const { data, loading, error, recargar } = useFetch<Cliente[]>(
    () => ClientesService.obtenerTodos(params),
    key
  )
  return { clientes: data ?? [], loading, error, recargar }
}
