import { useEffect, useState } from "react";
import { ReservasService, ClientesService, CanchasService, PagosService } from "@/services";
import { DateUtils, MoneyUtils, ReservaUtils } from "@/utils";
import {
  LuCalendar,
  LuDollarSign,
  LuUsers,
  LuChartBarIncreasing,
  LuSparkles,
} from "react-icons/lu";
import { DashboardReservationsTable } from "@/components/organims/tables";
import { SkeletonStatCard, Skeleton } from "@/components/atoms";
import {
  ReservasPorSemanaChart,
  ReservasPorCanchaPieChart,
  ReservasCambioPorCanchaChart,
  StatTileReservas,
} from "@/components/charts";
import { METODO_ICON, METODO_LABEL } from "@/mock";
import type { Reserva, MetodoPago, ReservasInsights } from "@/types";

type StatConfig = {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
};

type PagosStats = {
  mes: string;
  totalMes: number;
  porMetodo: { cantidad: string; total: string; metodoPago: string }[];
};

type ClientesStats = {
  total: number;
  activos: number;
  suspendidos: number;
  bloqueados: number;
};

export function DashboardTab() {
  const [reservasHoy, setReservasHoy] = useState<Reserva[]>([]);
  const [stats, setStats] = useState<StatConfig[]>([]);
  const [pagosStats, setPagosStats] = useState<PagosStats | null>(null);
  const [clientesStats, setClientesStats] = useState<ClientesStats | null>(null);
  const [insights, setInsights] = useState<ReservasInsights | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const hoy = DateUtils.fechaHoy();
        const [rHoy, rTodas, clientesEst, pagosEst, canchas, clientes, insightsEst] = await Promise.all([
          ReservasService.obtenerTodas({ fecha: hoy }),
          ReservasService.obtenerTodas(),
          ClientesService.obtenerEstadisticas(),
          PagosService.obtenerEstadisticas(),
          CanchasService.obtenerTodas(),
          ClientesService.obtenerTodos({ limite: "1000" }),
          ReservasService.obtenerInsights().catch(() => null),
        ]);

        setReservasHoy(ReservaUtils.enriquecer(rHoy, canchas, clientes));
        setPagosStats(pagosEst);
        setClientesStats(clientesEst);
        setInsights(insightsEst);

        const month = new Date().getMonth();
        const year = new Date().getFullYear();
        const ingresosReservas = rTodas
          .filter((r) => {
            if (r.estado !== "completada") return false;
            const [y, m] = r.fecha.split("-").map(Number);
            return m - 1 === month && y === year;
          })
          .reduce((s, r) => s + (r.precioTotal ?? 0), 0);

        const ingresosMes = pagosEst.totalMes > 0 ? pagosEst.totalMes : ingresosReservas;
        const ocupacion = rHoy.length > 0 ? Math.round((rHoy.length / 10) * 100) : 0;

        setStats([
          {
            label: "Reservas hoy",
            value: String(rHoy.length),
            Icon: LuCalendar,
            color: "text-emerald-700",
            bg: "bg-emerald-50 ring-emerald-200",
          },
          {
            label: "Ingresos del mes",
            value: MoneyUtils.formatear(ingresosMes),
            Icon: LuDollarSign,
            color: "text-sky-700",
            bg: "bg-sky-50 ring-sky-200",
          },
          {
            label: "Clientes activos",
            value: `${clientesEst.activos} / ${clientesEst.total}`,
            Icon: LuUsers,
            color: "text-purple-700",
            bg: "bg-purple-50 ring-purple-200",
          },
          {
            label: "Ocupación hoy",
            value: `${ocupacion}%`,
            Icon: LuChartBarIncreasing,
            color: "text-amber-700",
            bg: "bg-amber-50 ring-amber-200",
          },
        ]);
      } finally {
        setCargando(false);
      }
    }
    cargar().catch(console.error);
  }, []);

  const mesLabel = pagosStats
    ? new Date(pagosStats.mes + "-01").toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    : "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Resumen general de actividad del día
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cargando
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : stats.map(({ label, value, Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200/80 p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ring-1 ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold tracking-tight leading-none mb-1 ${color}`}>
                  {value}
                </div>
                <div className="text-[12px] text-slate-400 font-medium">{label}</div>
              </div>
            ))}
      </div>

      {/* Pagos del mes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-900">Pagos del mes</h2>
          {!cargando && pagosStats && (
            <span className="text-[12px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
              {mesLabel}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cargando
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : (pagosStats?.porMetodo ?? []).map((m) => {
                const Icon = METODO_ICON[m.metodoPago as MetodoPago] ?? LuDollarSign;
                const total = +m.total;
                const pct = pagosStats!.totalMes > 0
                  ? Math.round((total / pagosStats!.totalMes) * 100)
                  : 0;
                return (
                  <div
                    key={m.metodoPago}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon size={14} className="text-slate-500" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-700">
                        {METODO_LABEL[m.metodoPago as MetodoPago] ?? m.metodoPago}
                      </span>
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900 leading-none mb-1">
                      {MoneyUtils.formatear(total)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {m.cantidad} pago{+m.cantidad !== 1 ? "s" : ""} · {pct}% del total
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          {!cargando && (pagosStats?.porMetodo ?? []).length === 0 && (
            <p className="col-span-3 text-sm text-slate-400 py-4">Sin pagos registrados este mes.</p>
          )}
        </div>
      </div>

      {/* Tendencia de reservas (IA) */}
      {!cargando && insights && (
        <div className="mb-8">
          <h2 className="text-[15px] font-bold text-slate-900 mb-4">Tendencia de reservas</h2>
          {insights.resumen && (
            <p className="text-[13px] text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 mb-4 flex gap-2 items-start">
              <LuSparkles size={15} className="shrink-0 mt-0.5" />
              {insights.resumen}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
            <div
              className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-44"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <StatTileReservas
                totalActual={insights.totalActual}
                variacionPorcentual={insights.variacionPorcentual}
                porSemana={insights.porSemana}
              />
            </div>

            <div
              className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-44"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-[12px] font-bold text-slate-900 mb-2 flex-shrink-0">Por semana</h3>
              <div className="flex-1 min-h-0">
                {insights.porSemana.length === 0 ? (
                  <p className="text-slate-400 text-sm py-2">Sin reservas registradas en el período.</p>
                ) : (
                  <ReservasPorSemanaChart data={insights.porSemana} />
                )}
              </div>
            </div>

            <div
              className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-44"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-[12px] font-bold text-slate-900 mb-2 flex-shrink-0">Esta semana por cancha</h3>
              <div className="flex-1 min-h-0">
                <ReservasPorCanchaPieChart data={insights.porCancha} />
              </div>
            </div>

            <div
              className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-44"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h3 className="text-[12px] font-bold text-slate-900 mb-2 flex-shrink-0">Cambio por cancha</h3>
              <div className="flex-1 min-h-0">
                <ReservasCambioPorCanchaChart data={insights.porCancha} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de clientes */}
      {!cargando && clientesStats && (clientesStats.suspendidos > 0 || clientesStats.bloqueados > 0) && (
        <div className="mb-8">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Estado de clientes</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Activos: {clientesStats.activos}
            </span>
            {clientesStats.suspendidos > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Suspendidos: {clientesStats.suspendidos}
              </span>
            )}
            {clientesStats.bloqueados > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200/60">
                <span className="size-1.5 rounded-full bg-red-500" />
                Bloqueados: {clientesStats.bloqueados}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reservas de hoy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-900">Reservas de hoy</h2>
          {!cargando && (
            <span className="text-[12px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {reservasHoy?.length} total
            </span>
          )}
        </div>
        <DashboardReservationsTable reservas={reservasHoy} loading={cargando} />
      </div>
    </div>
  );
}
