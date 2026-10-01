export type Rol = 'cliente' | 'admin'

export interface Sesion {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  clienteId: number | null
  rol: Rol
  token: string
}

export interface RegistroData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
}
