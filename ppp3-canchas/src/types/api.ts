export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_show'
export type EstadoCancha = 'disponible' | 'mantenimiento' | 'fuera_servicio'

export interface Cancha {
  id: number
  nombre: string
  capacidad: number
  precioPorHora: number
  estado: EstadoCancha
  descripcion?: string
  latitud?: number | null
  longitud?: number | null
}

// Respuesta de POST /canchas/chat
export interface ChatCancha {
  id: number
  nombre: string
  precioPorHora: number
  descripcion?: string | null
  distanciaKm: number
  motivo?: string | null
}

export interface ChatRespuesta {
  respuesta: string
  canchas: ChatCancha[]
  enAlcance: boolean
  generadoConIa: boolean
}

export interface ChatHistorialItem {
  rol: 'usuario' | 'bot'
  texto: string
}

export interface ChatMensaje extends ChatHistorialItem {
  canchas?: ChatCancha[]
}

// Respuesta de GET /reservas/insights (admin) — tendencia semanal de reservas.
export interface ReservasPorSemana {
  semana: string
  cantidad: number
}

export interface ReservasPorCancha {
  canchaId: number
  nombre: string
  actual: number
  anterior: number
}

export interface ReservasInsights {
  porSemana: ReservasPorSemana[]
  porCancha: ReservasPorCancha[]
  totalActual: number
  totalAnterior: number
  variacionPorcentual: number
  resumen: string | null
  generadoConIa: boolean
}

export interface Reserva {
  id: number
  canchaId: number
  canchaNombre?: string
  clienteId: number
  clienteNombre?: string
  clienteApellido?: string
  clienteTelefono?: string
  fecha: string
  horaInicio: string
  horaFin: string
  estado: EstadoReserva
  precioTotal: number
  descuentoAplicado?: number
  senaRequerida: number
  observaciones?: string
  fechaCreacion?: string
}

export interface SlotOcupado {
  horaInicio: string
  horaFin: string
  estado: EstadoReserva
}

export type EstadoCliente = 'activo' | 'suspendido' | 'bloqueado'

export interface Cliente {
  id: number
  nombre: string
  apellido: string
  telefono: string
  email?: string
  tipoClienteId?: number
  estado?: EstadoCliente
  // Derivados (no provienen del recurso /clientes; se obtienen por endpoints aparte)
  descuentoPorcentaje?: number
  totalReservas?: number
  noShows?: number
}

export interface DisponibilidadHorario {
  horaInicio: string
  horaFin: string
  disponible: boolean
  esPasado?: boolean
}

export interface ApiError {
  message: string
  statusCode?: number
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'
export type TipoPago   = 'seña' | 'saldo' | 'completo' | 'devolucion'

export interface Pago {
  id: number
  reservaId: number
  monto: number
  tipoPago: TipoPago
  metodoPago: MetodoPago
  fechaPago: string
  observaciones?: string
}

// Respuesta de GET /pagos?reservaId= : pagos de la reserva + saldo derivado.
export interface SaldoReserva {
  pagos: Pago[]
  totalPagado: number
  saldoPendiente: number | null
}
