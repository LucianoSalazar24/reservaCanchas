import { useState } from "react";
import { useAuth } from "@/context";
import { ClientesService } from "@/services";
import { Modal, useAlert, FieldError, inputCls } from "@/components/atoms";

interface Props {
  onClose: () => void;
}

interface FormPerfil {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}

type FormErrors = { nombre: string; apellido: string; telefono: string };

const ERRORS_VACIO: FormErrors = { nombre: "", apellido: "", telefono: "" };

export function EditarPerfilModal({ onClose }: Props) {
  const { sesion, login } = useAuth();
  const { mostrar } = useAlert();

  const [form, setForm] = useState<FormPerfil>({
    nombre: sesion?.nombre ?? "",
    apellido: sesion?.apellido ?? "",
    telefono: sesion?.telefono ?? "",
    email: sesion?.email ?? "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>(ERRORS_VACIO);
  const [guardando, setGuardando] = useState(false);

  async function guardarPerfil() {
    if (!sesion?.clienteId) return;

    const errs = { ...ERRORS_VACIO };
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) errs.apellido = "El apellido es obligatorio";
    if (!/^\d{8,15}$/.test(form.telefono.trim()))
      errs.telefono = "Teléfono inválido (8 a 15 dígitos)";
    if (errs.nombre || errs.apellido || errs.telefono) {
      setFormErrors(errs);
      return;
    }

    setGuardando(true);
    setFormErrors(ERRORS_VACIO);
    try {
      const nombre = form.nombre.trim();
      const apellido = form.apellido.trim();
      const telefono = form.telefono.trim();
      const email = form.email.trim();
      await ClientesService.actualizar(sesion.clienteId, {
        nombre,
        apellido,
        telefono,
        email: email || undefined,
      });
      login({ ...sesion, nombre, apellido, telefono, email });
      mostrar("Datos actualizados", "success");
      onClose();
    } catch (err) {
      mostrar((err as Error).message || "Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo="Mis datos"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardarPerfil} disabled={guardando}>
            {guardando ? "Guardando" : "Guardar"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 mb-1">
        <div className="mb-4">
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
            Nombre
          </label>
          <input
            className={inputCls(formErrors.nombre)}
            value={form.nombre}
            onChange={(e) => {
              setForm({ ...form, nombre: e.target.value });
              setFormErrors((v) => ({ ...v, nombre: "" }));
            }}
          />
          <FieldError msg={formErrors.nombre} />
        </div>
        <div className="mb-4">
          <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
            Apellido
          </label>
          <input
            className={inputCls(formErrors.apellido)}
            value={form.apellido}
            onChange={(e) => {
              setForm({ ...form, apellido: e.target.value });
              setFormErrors((v) => ({ ...v, apellido: "" }));
            }}
          />
          <FieldError msg={formErrors.apellido} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Teléfono
        </label>
        <input
          className={inputCls(formErrors.telefono)}
          value={form.telefono}
          onChange={(e) => {
            setForm({ ...form, telefono: e.target.value });
            setFormErrors((v) => ({ ...v, telefono: "" }));
          }}
        />
        <FieldError msg={formErrors.telefono} />
      </div>
      <div className="mb-1">
        <label className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">
          Email <span className="text-slate-400 font-normal text-[12px]">(opcional)</span>
        </label>
        <input
          type="email"
          className="form-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
    </Modal>
  );
}
