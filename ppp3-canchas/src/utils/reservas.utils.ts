import type { Reserva, Cancha, Cliente } from '@/types'

export const ReservaUtils = {
  // Completa canchaNombre/clienteNombre a partir de los catálogos. Respeta el valor
  // si la reserva ya lo trae. Si no hay clientes (vista cliente), solo resuelve la cancha.
  enriquecer(reservas: Reserva[], canchas: Cancha[], clientes: Cliente[] = []): Reserva[] {
    const canchaPorId = new Map(canchas.map(c => [c.id, c.nombre]))
    const clientePorId = new Map(clientes.map(c => [c.id, `${c.nombre} ${c.apellido}`]))
    return reservas.map(r => ({
      ...r,
      canchaNombre: r.canchaNombre ?? canchaPorId.get(r.canchaId),
      clienteNombre: r.clienteNombre ?? clientePorId.get(r.clienteId),
    }))
  },
}
