import { useEffect, useMemo, useRef, useState } from "react";
import { LuSearch, LuChevronDown, LuChevronLeft, LuChevronRight, LuMapPin, LuX } from "react-icons/lu";
import { CanchaCard } from "./CanchaCard";
import { EmptyState } from "@/components/molecules";
import type { Cancha } from "@/types";

const SIN_ZONA = "Otras zonas";
// Con más canchas que estas la zona ofrece "Ver todas" (grilla) además del scroll horizontal.
const MIN_PARA_EXPANDIR = 4;

const FORMATOS = [
  { capacidad: 10, label: "Fútbol 5" },
  { capacidad: 14, label: "Fútbol 7" },
  { capacidad: 22, label: "Fútbol 11" },
];

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
        activo
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Cards de una zona en una sola fila deslizable (flechas, scroll táctil y snap). Con pocas
 * canchas no hay scroll y las cards quedan centradas (márgenes auto en los extremos: más
 * robusto que justify-center, que recortaría el borde izquierdo si hubiera overflow).
 */
function FilaDeslizable({ canchas }: { canchas: Cancha[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const actualizar = () => {
      setPuedeIzq(el.scrollLeft > 4);
      setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    actualizar();
    el.addEventListener("scroll", actualizar, { passive: true });
    const observer = new ResizeObserver(actualizar);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", actualizar);
      observer.disconnect();
    };
  }, [canchas]);

  function desplazar(direccion: 1 | -1) {
    const el = ref.current;
    if (el) el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const flecha =
    "absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:text-brand-700 hover:border-brand-400 transition-colors";

  return (
    <div className="relative">
      {puedeIzq && (
        <button type="button" aria-label="Ver anteriores" className={`${flecha} -left-3`} onClick={() => desplazar(-1)}>
          <LuChevronLeft size={20} />
        </button>
      )}
      {puedeDer && (
        <button type="button" aria-label="Ver siguientes" className={`${flecha} -right-3`} onClick={() => desplazar(1)}>
          <LuChevronRight size={20} />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-1 py-2 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {canchas.map((c) => (
          <div key={c.id} className="flex flex-col w-[min(320px,82vw)] shrink-0 snap-start first:ml-auto last:mr-auto [&>*]:flex-1">
            <CanchaCard cancha={c} mode="public" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Listado público de canchas pensado para crecer: buscador, filtros por zona y formato, y
 * agrupado por zona con "ver más" (no renderiza cientos de cards de golpe).
 */
export function CanchasListado({ canchas }: { canchas: Cancha[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [zona, setZona] = useState<string | null>(null);
  const [capacidad, setCapacidad] = useState<number | null>(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const zonasConConteo = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const c of canchas) {
      const z = c.zona?.trim() || SIN_ZONA;
      conteo.set(z, (conteo.get(z) ?? 0) + 1);
    }
    return [...conteo.entries()].sort(([a], [b]) => (a === SIN_ZONA ? 1 : b === SIN_ZONA ? -1 : a.localeCompare(b)));
  }, [canchas]);

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return canchas.filter((c) => {
      if (zona && (c.zona?.trim() || SIN_ZONA) !== zona) return false;
      if (capacidad && c.capacidad !== capacidad) return false;
      if (!q) return true;
      return normalizar(`${c.nombre} ${c.zona ?? ""} ${c.descripcion ?? ""}`).includes(q);
    });
  }, [canchas, busqueda, zona, capacidad]);

  const grupos = useMemo(() => {
    const porZona = new Map<string, Cancha[]>();
    for (const c of filtradas) {
      const z = c.zona?.trim() || SIN_ZONA;
      porZona.set(z, [...(porZona.get(z) ?? []), c]);
    }
    return [...porZona.entries()]
      .sort(([a], [b]) => (a === SIN_ZONA ? 1 : b === SIN_ZONA ? -1 : a.localeCompare(b)))
      .map(([nombre, lista]) => ({ nombre, lista: lista.sort((x, y) => x.nombre.localeCompare(y.nombre)) }));
  }, [filtradas]);

  const hayFiltros = !!busqueda.trim() || zona !== null || capacidad !== null;
  // Buscando, se muestran todos los resultados: el usuario ya acotó lo que quiere ver.
  const mostrarTodo = hayFiltros;

  function limpiar() {
    setBusqueda("");
    setZona(null);
    setCapacidad(null);
  }

  function alternar(nombre: string) {
    setExpandidas((prev) => {
      const sig = new Set(prev);
      if (!sig.delete(nombre)) sig.add(nombre);
      return sig;
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative max-w-xl mx-auto w-full">
          <LuSearch size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="form-input w-full !pl-10"
            placeholder="Buscar por nombre, zona o características…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar canchas"
          />
        </div>

        {zonasConConteo.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center" aria-label="Filtrar por zona">
            <Chip activo={zona === null} onClick={() => setZona(null)}>
              Todas las zonas · {canchas.length}
            </Chip>
            {zonasConConteo.map(([nombre, cantidad]) => (
              <Chip key={nombre} activo={zona === nombre} onClick={() => setZona(zona === nombre ? null : nombre)}>
                {nombre} · {cantidad}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center" aria-label="Filtrar por formato">
          <Chip activo={capacidad === null} onClick={() => setCapacidad(null)}>
            Todos los formatos
          </Chip>
          {FORMATOS.map((f) => (
            <Chip key={f.capacidad} activo={capacidad === f.capacidad} onClick={() => setCapacidad(capacidad === f.capacidad ? null : f.capacidad)}>
              {f.label}
            </Chip>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 text-[13px] text-slate-500">
          <span>
            {filtradas.length} {filtradas.length === 1 ? "cancha" : "canchas"}
            {grupos.length > 1 && ` en ${grupos.length} zonas`}
          </span>
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
              <LuX size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {!grupos.length ? (
        <EmptyState
          icono="🔎"
          titulo="No encontramos canchas con esos filtros"
          descripcion="Probá con otra zona, otro formato o una búsqueda distinta."
          accion={
            <button type="button" className="btn btn-outline" onClick={limpiar}>
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {grupos.map(({ nombre, lista }) => {
            const abierta = mostrarTodo || expandidas.has(nombre);
            return (
              <section key={nombre} aria-labelledby={`zona-${nombre}`}>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <LuMapPin size={16} className="text-brand-600" />
                  <h3 id={`zona-${nombre}`} className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {nombre}
                  </h3>
                  <span className="text-[12px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {lista.length}
                  </span>
                  {!mostrarTodo && lista.length >= MIN_PARA_EXPANDIR && (
                    <button
                      type="button"
                      onClick={() => alternar(nombre)}
                      className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline"
                    >
                      {abierta ? "Ver en fila" : `Ver las ${lista.length}`}
                      <LuChevronDown size={14} className={abierta ? "rotate-180" : ""} />
                    </button>
                  )}
                </div>
                {abierta ? (
                  <div className="flex flex-wrap justify-center gap-6">
                    {lista.map((c) => (
                      <div key={c.id} className="flex flex-col w-[min(320px,100%)] [&>*]:flex-1">
                        <CanchaCard cancha={c} mode="public" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <FilaDeslizable canchas={lista} />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

