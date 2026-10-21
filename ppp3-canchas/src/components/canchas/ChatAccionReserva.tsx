import { useState } from "react";
import { LuCalendarCheck, LuCheck, LuLogIn } from "react-icons/lu";
import { useAuth } from "@/context";
import { DateUtils, MoneyUtils } from "@/utils";
import { METODO_LABEL } from "@/mock";
import type { ChatAccionReserva as Accion, ChatReservaCreada, EstadoAccionChat, MetodoPago } from "@/types";

const METODOS: MetodoPago[] = ["efectivo", "tarjeta", "transferencia"];

interface Props {
  accion: Accion & { estado: EstadoAccionChat; reserva?: ChatReservaCreada };
  onLogin: (email: string, password: string) => Promise<void>;
  onConfirmar: () => void;
  onDescartar: () => void;
  onPagar: (metodo: MetodoPago) => void;
}

/**
 * Tarjeta del chat que lleva la reserva de punta a punta sin salir del chat:
 * login (si hace falta) → confirmar → pagar la seña. Todo se resuelve con endpoints
 * normales desde acá; el modelo solo propone y nunca ve contraseñas ni datos de pago.
 */
export function ChatAccionReserva({ accion, onLogin, onConfirmar, onDescartar, onPagar }: Props) {
  const { sesion } = useAuth();
  const logueado = !!sesion?.clienteId;
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const { estado } = accion;

  return (
    <div className="mt-2 w-full max-w-[95%] bg-white rounded-xl border border-brand-200 p-3.5 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-brand-700">
        <LuCalendarCheck size={14} /> {estado === "pendiente" || estado === "confirmando" ? "Reserva para confirmar" : "Tu reserva"}
      </div>
      <div className="text-[13px] text-slate-700 leading-relaxed">
        <p className="font-bold text-slate-900">{accion.canchaNombre}</p>
        <p className="first-letter:uppercase">{DateUtils.formatearFechaCompleta(accion.fecha)}</p>
        <p>
          {DateUtils.formatearHora(accion.horaInicio)} – {DateUtils.formatearHora(accion.horaFin)}
        </p>
        <p className="font-extrabold text-brand-700 mt-1">
          {MoneyUtils.formatear(accion.reserva?.precioTotal ?? accion.precioEstimado)}
          {!accion.reserva && <span className="text-[11px] text-slate-400 font-medium"> estimado</span>}
        </p>
      </div>

      {estado === "descartada" && <p className="text-[12px] text-slate-400">Descartada</p>}

      {(estado === "pendiente" || estado === "confirmando") &&
        (logueado ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary text-[12px] py-1.5 flex-1"
              disabled={estado === "confirmando"}
              onClick={onConfirmar}
            >
              {estado === "confirmando" ? "Reservando…" : "Confirmar reserva"}
            </button>
            <button type="button" className="btn btn-outline text-[12px] py-1.5" disabled={estado === "confirmando"} onClick={onDescartar}>
              Cancelar
            </button>
          </div>
        ) : (
          <LoginEnChat onLogin={onLogin} onDescartar={onDescartar} />
        ))}

      {(estado === "reservada" || estado === "pagando") && accion.reserva && (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
          <p className="text-[12px] text-slate-600">
            Seña a pagar:{" "}
            <span className="font-bold text-slate-900">{MoneyUtils.formatear(accion.reserva.senaRequerida)}</span>{" "}
            <span className="text-slate-400">(pago simulado)</span>
          </p>
          <div className="flex gap-1.5">
            {METODOS.map((m) => (
              <button
                key={m}
                type="button"
                disabled={estado === "pagando"}
                onClick={() => setMetodo(m)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-[11.5px] font-semibold transition-colors ${
                  metodo === m
                    ? "border-brand-700 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {METODO_LABEL[m] ?? m}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary text-[12px] py-1.5" disabled={estado === "pagando"} onClick={() => onPagar(metodo)}>
            {estado === "pagando" ? "Pagando…" : `Pagar seña ${MoneyUtils.formatear(accion.reserva.senaRequerida)}`}
          </button>
        </div>
      )}

      {estado === "pagada" && (
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
          <LuCheck size={14} /> Reserva confirmada · seña pagada
        </p>
      )}
    </div>
  );
}

function LoginEnChat({ onLogin, onDescartar }: Pick<Props, "onLogin" | "onDescartar">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || enviando) return;
    setEnviando(true);
    setError("");
    try {
      await onLogin(email.trim(), password);
      setPassword("");
    } catch (err) {
      setError((err as Error).message || "No pude iniciar sesión.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-slate-100 pt-2">
      <p className="text-[12px] text-slate-600">Iniciá sesión para confirmar la reserva:</p>
      <input
        type="email"
        className="form-input"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={enviando}
      />
      <input
        type="password"
        className="form-input"
        placeholder="Contraseña"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={enviando}
      />
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary text-[12px] py-1.5 flex-1" disabled={enviando || !email.trim() || !password}>
          <LuLogIn size={13} /> {enviando ? "Ingresando…" : "Iniciar sesión"}
        </button>
        <button type="button" className="btn btn-outline text-[12px] py-1.5" disabled={enviando} onClick={onDescartar}>
          Cancelar
        </button>
      </div>
      <a href="/login" className="text-[11.5px] text-brand-700 underline text-center">
        ¿No tenés cuenta? Crearla
      </a>
    </form>
  );
}
