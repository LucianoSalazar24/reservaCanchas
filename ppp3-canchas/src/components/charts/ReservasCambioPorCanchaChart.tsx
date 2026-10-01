import { useState } from "react";
import type { ReservasPorCancha } from "@/types";

const MAX_FILAS = 4;

// Cambio por cancha (actual - anterior): "por encima/debajo de una base" es un
// diverging bar, no un grouped bar — y como el signo ACÁ significa "subió" (bueno) o
// "bajó" (malo) para el negocio, el color es de estado (verde/rojo), no identidad.
export function ReservasCambioPorCanchaChart({ data }: { data: ReservasPorCancha[] }) {
  const [tabla, setTabla] = useState(false);

  const cambios = data
    .map((d) => ({ ...d, delta: d.actual - d.anterior }))
    .filter((d) => d.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  if (cambios.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm">Ninguna cancha cambió su cantidad de reservas esta semana.</p>
      </div>
    );
  }

  const mostrar = cambios.slice(0, MAX_FILAS);
  const maxAbs = Math.max(...mostrar.map((d) => Math.abs(d.delta)), 1);
  // El valor va siempre en una columna fija a la derecha (no pegado a la punta de la
  // barra): con una sola fila la barra ocupa medio track y un label "flotante" en la
  // punta se va del contenedor. Fijo es más robusto que perseguir la punta.
  const pct = (v: number) => (Math.abs(v) / maxAbs) * 50;

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
              <th className="font-semibold py-1.5 text-right">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {cambios.map((d) => (
              <tr key={d.canchaId} className="border-b border-slate-50">
                <td className="py-1.5 text-slate-600">{d.nombre}</td>
                <td className={`py-1.5 text-right font-semibold tabular-nums ${d.delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {d.delta > 0 ? "+" : ""}
                  {d.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex-1 flex flex-col justify-center gap-3">
          {mostrar.map((d) => {
            const sube = d.delta > 0;
            const ancho = pct(d.delta);
            return (
              <div key={d.canchaId} className="grid grid-cols-[84px_1fr_30px] gap-2 items-center">
                <span className="text-[11.5px] text-slate-600 truncate" title={d.nombre}>
                  {d.nombre}
                </span>
                <div className="relative h-2.5">
                  <div className="absolute left-1/2 -top-1 -bottom-1 w-px bg-slate-200" />
                  <div
                    className={`absolute top-0 bottom-0 ${
                      sube ? "left-1/2 rounded-r-full bg-emerald-500" : "right-1/2 rounded-l-full bg-red-500"
                    }`}
                    style={{ width: `${ancho}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold tabular-nums text-right ${sube ? "text-emerald-600" : "text-red-600"}`}
                >
                  {sube ? "+" : ""}
                  {d.delta}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
