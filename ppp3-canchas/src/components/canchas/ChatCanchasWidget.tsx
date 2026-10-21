import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useChatCanchas } from "@/hooks";
import { ChatAccionReserva } from "./ChatAccionReserva";
import { MoneyUtils } from "@/utils";
import { LuSend, LuArrowRight, LuBot, LuX, LuMessageCircle } from "react-icons/lu";

// El chatbot es para clientes buscando cancha: no tiene sentido en /login ni en /admin.
const RUTAS_OCULTAS = ["/login", "/admin"];

export function ChatCanchasWidget() {
  const location = useLocation();
  const { mensajes, enviando, enviar, iniciarSesion, confirmarReserva, descartarReserva, pagarSena } = useChatCanchas();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, enviando, abierto]);

  if (RUTAS_OCULTAS.some((r) => location.pathname.startsWith(r))) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    enviar(texto);
    setTexto("");
  }

  return (
    <>
      {abierto && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[min(380px,calc(100vw-2rem))] bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden"
          style={{ boxShadow: "0 20px 45px -10px rgba(15,23,42,0.25)" }}
        >
          <div className="flex items-center justify-between gap-2.5 px-4 py-3.5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white flex-shrink-0">
                <LuBot size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-900 leading-tight">Asistente de canchas</p>
                <p className="text-[11px] text-slate-400 leading-tight truncate">
                  Te ayuda a encontrar y elegir una cancha
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
            >
              <LuX size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-4 h-[420px] overflow-y-auto">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.rol === "usuario" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
                    m.rol === "usuario"
                      ? "bg-brand-700 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {m.texto}
                </div>

                {!!m.canchas?.length && (
                  <div className="mt-2 flex flex-col gap-2 w-full max-w-[95%]">
                    {m.canchas.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-slate-900 text-[13px] leading-tight">{c.nombre}</span>
                          {c.distanciaKm != null && (
                            <span className="shrink-0 text-[10.5px] font-semibold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">
                              {c.distanciaKm} km
                            </span>
                          )}
                        </div>
                        {(c.zona || c.formato) && (
                          <p className="text-[12px] text-slate-500">
                            {[c.formato && `Fútbol ${c.formato}`, c.zona].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[14px] font-extrabold text-brand-700">
                            {MoneyUtils.formatear(c.precioPorHora)}
                            <span className="text-[11px] text-slate-400 font-medium">/hora</span>
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline text-[11.5px] py-1"
                            onClick={() => enviar(`Quiero reservar ${c.nombre}`)}
                            disabled={enviando}
                          >
                            Reservar <LuArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {m.accion && (
                  <ChatAccionReserva
                    accion={m.accion}
                    onLogin={iniciarSesion}
                    onConfirmar={() => confirmarReserva(i)}
                    onDescartar={() => descartarReserva(i)}
                    onPagar={(metodo) => pagarSena(i, metodo)}
                  />
                )}
              </div>
            ))}

            {enviando && (
              <div className="flex items-start">
                <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-bl-sm px-4 py-2.5 text-[13px]">
                  Escribiendo…
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-slate-100">
            <input
              className="form-input flex-1"
              placeholder="Ej: fútbol 5 techada en Caballito mañana 20hs"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={300}
              disabled={enviando}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={enviando || !texto.trim()}>
              <LuSend size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center hover:bg-brand-800 hover:-translate-y-0.5 transition-all"
        style={{ boxShadow: "0 10px 25px -5px rgba(4,120,87,0.5)" }}
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar chat" : "Abrir chat de canchas"}
      >
        {abierto ? <LuX size={22} /> : <LuMessageCircle size={22} />}
      </button>
    </>
  );
}
