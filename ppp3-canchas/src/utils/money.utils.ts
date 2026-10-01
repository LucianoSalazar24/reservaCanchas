export const MoneyUtils = {
  formatear(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(monto)
  },

  calcularSena(total: number, porcentaje = 30): number {
    return Math.ceil(total * (porcentaje / 100))
  },
}
