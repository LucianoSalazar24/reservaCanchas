export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_show'
export type EstadoCancha = 'disponible' | 'mantenimiento' | 'fuera_servicio'

export interface Cancha {
  id: number
  nombre: string
  capacidad: number
  precioPorHora: number
  estado: EstadoCancha
  descripcion?: string
  zona?: string | null
  emailContacto?: string | null
  latitud?: number | null
  longitud?: number | null
}

// Respuesta de POST /canchas/chat
export interface ChatCancha {
  id: number
  nombre: string
  zona?: string | null
  formato?: number | null
  precioPorHora: number
  descripcion?: string | null
  // Solo viene si el usuario compartió su ubicación.
  distanciaKm?: number
}

// Reserva ya validada por el backend; el usuario la confirma con un botón (el modelo no la crea).
export interface ChatAccionReserva {
  tipo: 'reserva'
  canchaId: number
  canchaNombre: string
  fecha: string
  horaInicio: string
  horaFin: string
  precioEstimado: number
  // true si al proponerla el usuario no estaba logueado (el chat muestra el login).
  requiereLogin: boolean
}

export interface ChatRespuesta {
  respuesta: string
  canchas: ChatCancha[]
  accionPendiente: ChatAccionReserva | null
  enAlcance: boolean
  generadoConIa: boolean
}

export interface ChatHistorialItem {
  rol: 'usuario' | 'bot'
  texto: string
  canchas?: { id: number; nombre: string }[]
}

// pendiente → confirmando → reservada (creada, falta la seña) → pagando → pagada
export type EstadoAccionChat = 'pendiente' | 'confirmando' | 'reservada' | 'pagando' | 'pagada' | 'descartada'

export interface ChatReservaCreada {
  id: number
  precioTotal: number
  senaRequerida: number
}

export interface ChatMensaje extends ChatHistorialItem {
  canchas?: ChatCancha[]
  accion?: ChatAccionReserva & { estado: EstadoAccionChat; reserva?: ChatReservaCreada }
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
