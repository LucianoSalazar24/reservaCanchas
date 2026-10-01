// Helpers compartidos por los charts de dataviz (escala, ticks, barra con punta redondeada).

/** Ticks "lindos" (0, step, 2*step, ...) que cubren [0, max]. */
export function nicioTicks(max: number, cantidad = 4): number[] {
  if (max <= 0) return [0, 1]
  const bruto = max / Math.max(1, cantidad - 1)
  const magnitud = Math.pow(10, Math.floor(Math.log10(bruto)))
  const norm = bruto / magnitud
  const normLindo = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  const step = normLindo * magnitud
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.5; v += step) ticks.push(Math.round(v))
  return ticks
}

/** Path SVG de una barra con esquinas redondeadas solo arriba (cuadrada en la base). */
export function barraPuntaRedondeada(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return ''
  const radio = Math.min(r, w / 2, h)
  return `M${x},${y + h} V${y + radio} Q${x},${y} ${x + radio},${y} H${x + w - radio} Q${x + w},${y} ${x + w},${y + radio} V${y + h} Z`
}

function puntoPolar(cx: number, cy: number, r: number, angulo: number) {
  return { x: cx + r * Math.cos(angulo), y: cy + r * Math.sin(angulo) }
}

/** Path SVG de una porción de torta, de anguloInicio a anguloFin (radianes, 0 = derecha). */
export function porcionTorta(cx: number, cy: number, r: number, anguloInicio: number, anguloFin: number): string {
  const inicio = puntoPolar(cx, cy, r, anguloFin)
  const fin = puntoPolar(cx, cy, r, anguloInicio)
  const arcoLargo = anguloFin - anguloInicio > Math.PI ? 1 : 0
  return `M${cx},${cy} L${inicio.x},${inicio.y} A${r},${r} 0 ${arcoLargo} 0 ${fin.x},${fin.y} Z`
}

// Paleta categórica validada (CVD-safe, ver skill de dataviz): en un gráfico de torta
// cualquier par de porciones puede terminar adyacente, así que solo las primeras 3
// posiciones pasan el chequeo "all-pairs" — de ahí el techo de 3 + "Otras" en gris.
export const COLORES_CATEGORICOS = ['#2a78d6', '#eb6834', '#1baf7a'] as const
export const COLOR_OTRAS = '#64748b'
