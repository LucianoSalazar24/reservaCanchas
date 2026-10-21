import { useState, useSyncExternalStore } from "react";
import { LuDownload, LuShare, LuX } from "react-icons/lu";
import { esIos, estaInstalada, instalar, puedeInstalar, suscribirInstalacion } from "@/lib/pwa";

const CLAVE_CERRADO = "pwa-aviso-cerrado";

function leerCerrado(): boolean {
  try {
    return localStorage.getItem(CLAVE_CERRADO) === "1";
  } catch {
    return false;
  }
}

/**
 * Aviso para instalar la web como app, solo en celular. En Android/Chrome abre el diálogo nativo;
 * en iPhone (que no tiene ese diálogo) explica cómo hacerlo desde "Compartir".
 */
export function InstalarAppAviso() {
  const disponible = useSyncExternalStore(suscribirInstalacion, puedeInstalar);
  const [cerrado, setCerrado] = useState(leerCerrado);
  const ios = esIos();

  if (cerrado || estaInstalada() || (!disponible && !ios)) return null;

  function cerrar() {
    setCerrado(true);
    try {
      localStorage.setItem(CLAVE_CERRADO, "1");
    } catch {
      /* sin storage (modo privado): el aviso vuelve a aparecer la próxima vez, no pasa nada */
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar la app"
      className="sm:hidden fixed z-40 left-3 right-20 bottom-[max(1.25rem,env(safe-area-inset-bottom))] bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center gap-3"
      style={{ boxShadow: "0 12px 30px -8px rgba(15,23,42,0.3)" }}
    >
      <img src="/pwa-192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-slate-900 leading-tight">Instalá FutbolReservas</p>
        {ios ? (
          <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">
            Tocá <LuShare className="inline -mt-0.5" size={12} /> Compartir y después «Agregar a inicio».
          </p>
        ) : (
          <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5">Abrila como una app, desde tu pantalla de inicio.</p>
        )}
      </div>
      {!ios && (
        <button type="button" className="btn btn-primary btn-small shrink-0" onClick={() => void instalar()}>
          <LuDownload size={13} /> Instalar
        </button>
      )}
      <button type="button" className="-m-1 p-1.5 text-slate-400 shrink-0" onClick={cerrar} aria-label="Cerrar aviso">
        <LuX size={16} />
      </button>
    </div>
  );
}
