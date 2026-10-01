import { useState } from "react";
import type { ReservasPorCancha } from "@/types";
import { porcionTorta, COLORES_CATEGORICOS, COLOR_OTRAS } from "./chart.utils";

const SIZE = 108;
const R = 42;
const C = SIZE / 2;

interface Porcion {
  nombre: string;
  actual: number;
  anterior: number;
  color: string;
}

// Torta = participación de cada cancha en las reservas de ESTA semana (part-to-whole).
// Como en una torta cualquier par de porciones puede terminar adyacente, la paleta
// categórica solo garantiza distinguibilidad para las primeras 3 posiciones: de ahí el
// techo de 3 canchas + "Otras" en gris en vez de una porción por cancha.
export function ReservasPorCanchaPieChart({ data }: { data: ReservasPorCancha[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [tabla, setTabla] = useState(false);

  const activas = data.filter((d) => d.actual > 0).sort((a, b) => b.actual - a.actual);
  const total = activas.reduce((s, d) => s + d.actual, 0);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm">Sin reservas esta semana para repartir.</p>
      </div>
    );
  }

  const top = activas.slice(0, 3);
  const resto = activas.slice(3);

  const porciones: Porcion[] = top.map((d, i) => ({
    nombre: d.nombre,
    actual: d.actual,
    anterior: d.anterior,
    color: COLORES_CATEGORICOS[i],
  }));
  if (resto.length > 0) {
    porciones.push({
      nombre: `Otras (${resto.length})`,
      actual: resto.reduce((s, d) => s + d.actual, 0),
      anterior: resto.reduce((s, d) => s + d.anterior, 0),
      color: COLOR_OTRAS,
    });
  }

  let acumulado = 0;
  const arcos = porciones.map((p) => {
    const inicio = (acumulado / total) * Math.PI * 2 - Math.PI / 2;
    acumulado += p.actual;
    const fin = (acumulado / total) * Math.PI * 2 - Math.PI / 2;
    return { ...p, inicio, fin, pct: Math.round((p.actual / total) * 100) };
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-1 flex-shrink-0">
        <button
          type="button"
          className="text-[11px] font-semibold text-slate-400 hover:text-brand-700 transition-colors"
          onClick={() => setTabla((v) => !v)}
        >
          {tabla ? "Ver gráfico" : "Ver como tabla"}
        </button>
      </div>

      {tabla ? (
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="font-semibold py-1.5">Cancha</th>
              <th className="font-semibold py-1.5 text-right">Esta semana</th>
              <th className="font-semibold py-1.5 text-right">Anterior</th>
            </tr>
          </thead>
          <tbody>
            {activas.map((d) => (
              <tr key={d.canchaId} className="border-b border-slate-50">
                <td className="py-1.5 text-slate-600">{d.nombre}</td>
                <td className="py-1.5 text-right font-semibold text-slate-900 tabular-nums">{d.actual}</td>
                <td className="py-1.5 text-right text-slate-500 tabular-nums">{d.anterior}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" role="img" aria-label="Reservas de esta semana por cancha">
              {arcos.map((a, i) => (
                <path
                  key={a.nombre}
                  d={porcionTorta(C, C, R, a.inicio, a.fin)}
                  fill={a.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                  style={{ transition: "opacity 0.15s", cursor: "pointer" }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${a.nombre}: ${a.actual} reservas esta semana, ${a.pct}%`}
                />
              ))}
            </svg>
            {hover !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 rounded-lg px-1.5 py-1 text-center shadow-sm border border-slate-100">
                  <p className="text-[12px] font-extrabold text-slate-900 leading-none">{arcos[hover].pct}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {arcos.map((a, i) => {
              const delta = a.actual - a.anterior;
              return (
                <div
                  key={a.nombre}
                  className="flex items-center gap-1.5 cursor-pointer"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span
                    className="w-2 h-2 rounded-[2px] flex-shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-[11px] text-slate-600 truncate flex-1" title={a.nombre}>
                    {a.nombre}
                  </span>
                  <span className="text-[11px] font-bold text-slate-900 tabular-nums">{a.actual}</span>
                  {delta !== 0 && (
                    <span className={`text-[9.5px] font-bold ${delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
