import { useState } from "react";
import { useAuth } from "@/context";
import { ClientesService } from "@/services";
import { FieldError, inputCls } from "@/components/atoms";
import { PASO1_EMPTY } from "@/mock";
import type { DatosCliente } from "./ReservarPage";

interface Props {
  onNext: (datos: DatosCliente) => void;
}

type Errors = { telefono: string; nombre: string; apellido: string };

export function Paso1Cliente({ onNext }: Props) {
  const { sesion } = useAuth();
  const esCliente = sesion?.rol === 'cliente';

  // Inicializar directo desde sesión (localStorage es sincrónico)
  const [telefono, setTelefono] = useState(esCliente ? (sesion.telefono ?? "") : "");
  const [nombre, setNombre] = useState(esCliente ? (sesion.nombre ?? "") : "");
  const [apellido, setApellido] = useState(esCliente ? (sesion.apellido ?? "") : "");
  const [email, setEmail] = useState(esCliente ? (sesion.email ?? "") : "");
  const [clienteId, setClienteId] = useState<number | null>(esCliente ? (sesion.clienteId ?? null) : null);
  const [errors, setErrors] = useState<Errors>(PASO1_EMPTY);

  // Estado del flujo de búsqueda (solo para no logueados)
  const [buscando, setBuscando] = useState(false);
  const [datosVisibles, setDatosVisibles] = useState(false);
  const [readonly, setReadonly] = useState(false);

  async function buscarCliente() {
    const errs = { ...PASO1_EMPTY };
    if (!telefono.trim()) errs.telefono = "Ingresá un número de teléfono";
    else if (!/^\d{8,15}$/.test(telefono))
      errs.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (errs.telefono) { setErrors(errs); return; }

    setBuscando(true);
    try {
      const cliente = await ClientesService.buscarPorTelefono(telefono);
      if (cliente) {
        setNombre(cliente.nombre);
        setApellido(cliente.apellido);
        setEmail(cliente.email ?? "");
        setClienteId(cliente.id);
        setReadonly(true);
      } else throw new Error();
    } catch {
      setNombre("");
      setApellido("");
      setEmail("");
      setClienteId(null);
      setReadonly(false);
      setErrors((v) => ({ ...v, telefono: "No encontramos ese teléfono. Completá los datos para registrarte." }));
    } finally {
      setBuscando(false);
      setDatosVisibles(true);
    }
  }

  function validarYSiguiente() {
    const errs = { ...PASO1_EMPTY };
    if (!telefono) errs.telefono = "El teléfono es requerido";
    else if (!/^\d{8,15}$/.test(telefono)) errs.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (!nombre) errs.nombre = "El nombre es requerido";
    if (!apellido) errs.apellido = "El apellido es requerido";
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
    onNext({ id: clienteId, nombre, apellido, telefono, email, esNuevo: !clienteId });
  }

  // --- Render para usuario logueado ---
  if (sesion?.rol === 'cliente') {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Paso 1: Tus Datos</h2>
        <p className="text-sm text-slate-400 mb-6">
          Revisá tus datos y modificá si es necesario antes de continuar.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls(errors.nombre)}
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors((v) => ({ ...v, nombre: "" })); }}
            />
            <FieldError msg={errors.nombre} />
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls(errors.apellido)}
              value={apellido}
              onChange={(e) => { setApellido(e.target.value); setErrors((v) => ({ ...v, apellido: "" })); }}
            />
            <FieldError msg={errors.apellido} />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className={inputCls(errors.telefono)}
            value={telefono}
            onChange={(e) => { setTelefono(e.target.value); setErrors((v) => ({ ...v, telefono: "" })); }}
          />
          <FieldError msg={errors.telefono} />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
            Email{" "}
            <span className="text-slate-400 font-normal text-[12px]">(opcional)</span>
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
          <button type="button" className="btn btn-primary" onClick={validarYSiguiente}>
            Siguiente →
          </button>
        </div>
      </div>
    );
  }

  // --- Render para usuario no logueado (búsqueda por teléfono) ---
  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Paso 1: Tus Datos</h2>
      <p className="text-sm text-slate-400 mb-6">
        Buscá tu teléfono o completá los datos para registrarte.
      </p>

      <div className="mb-5">
        <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="tel"
              className={inputCls(errors.telefono)}
              placeholder="Ej: 1123456789"
              value={telefono}
              onChange={(e) => { setTelefono(e.target.value); setErrors((v) => ({ ...v, telefono: "" })); }}
            />
            <FieldError msg={errors.telefono} />
          </div>
          <button
            type="button"
            className="btn btn-outline self-start whitespace-nowrap"
            onClick={buscarCliente}
            disabled={buscando}
          >
            {buscando ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </div>

      {datosVisibles && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-5">
              <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls(errors.nombre)}
                value={nombre}
                readOnly={readonly}
                onChange={(e) => { setNombre(e.target.value); setErrors((v) => ({ ...v, nombre: "" })); }}
              />
              <FieldError msg={errors.nombre} />
            </div>
            <div className="mb-5">
              <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls(errors.apellido)}
                value={apellido}
                readOnly={readonly}
                onChange={(e) => { setApellido(e.target.value); setErrors((v) => ({ ...v, apellido: "" })); }}
              />
              <FieldError msg={errors.apellido} />
            </div>
          </div>
          <div className="mb-5">
            <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
              Email{" "}
              <span className="text-slate-400 font-normal text-[12px]">(opcional)</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              readOnly={readonly}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          className="btn btn-primary"
          onClick={validarYSiguiente}
          disabled={!datosVisibles}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
