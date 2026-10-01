export const DateUtils = {
  formatearFecha(fecha: string): string {
    if (!fecha) return ''
    const [year, month, day] = fecha.split('-')
    return `${day}/${month}/${year}`
  },

  formatearFechaHora(iso: string): { fecha: string; hora: string } {
    if (!iso) return { fecha: '', hora: '' }
    const d = new Date(iso)
    return {
      fecha: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    }
  },

  formatearFechaCompleta(fecha: string): string {
    if (!fecha) return ''
    const date = new Date(fecha + 'T00:00:00')
    return date.toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  },

  fechaHoy(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  },

  horaActual(): string {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  },

  esHoy(fecha: string): boolean {
    return fecha === DateUtils.fechaHoy()
  },

  formatearHora(hora: string): string {
    if (!hora) return ''
    return hora.slice(0, 5)
  },

  calcularDuracion(horaInicio: string, horaFin: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number)
    const [h2, m2] = horaFin.split(':').map(Number)
    return (h2 * 60 + m2 - h1 * 60 - m1) / 60
  },
}
