import { DateUtils } from './date.utils'
import { HORARIOS_DISPONIBLES } from '@/mock'

export const HorarioUtils = {
  generarOpciones(fecha: string, horaInicio?: string): string[] {
    const esHoy = DateUtils.esHoy(fecha)
    const horaActual = DateUtils.horaActual()

    return HORARIOS_DISPONIBLES.filter(hora => {
      if (esHoy && hora <= horaActual) return false
      if (horaInicio) return hora > horaInicio
      return true
    })
  },

  esPasado(fecha: string, horaFin: string): boolean {
    if (!DateUtils.esHoy(fecha)) return false
    return horaFin <= DateUtils.horaActual()
  },
}
