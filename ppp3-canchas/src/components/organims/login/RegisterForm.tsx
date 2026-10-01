import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import { AuthService } from "@/services";
import { LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";
import { FieldError, inputCls } from "@/components/atoms";
import { REGISTER_INITIAL } from "@/mock";

interface RegisterFormProps {
  mostrar: (
    msg: string,
    tipo: "success" | "error" | "warning" | "info",
  ) => void;
}

type RegErrors = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  passwordConfirm: string;
};

export function RegisterForm({ mostrar }: RegisterFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState(REGISTER_INITIAL);
  const [errs, setErrs] = useState<RegErrors>(REGISTER_INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrs((e) => ({ ...e, [k]: "" }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { nombre, apellido, email, telefono, password, passwordConfirm } =
      form;
    const next = { ...REGISTER_INITIAL };
    if (!nombre) next.nombre = "El nombre es requerido";
    if (!apellido) next.apellido = "El apellido es requerido";
    if (!email) next.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Formato de email inválido";
    if (!telefono) next.telefono = "El teléfono es requerido";
    else if (!/^\d{8,15}$/.test(telefono))
      next.telefono = "Solo dígitos, 8 a 15 caracteres";
    if (!password) next.password = "La contraseña es requerida";
    else if (password.length < 6) next.password = "Mínimo 6 caracteres";
    if (!passwordConfirm) next.passwordConfirm = "Confirmá tu contraseña";
    else if (password !== passwordConfirm)
      next.passwordConfirm = "Las contraseñas no coinciden";
    if (Object.values(next).some(Boolean)) {
      setErrs(next);
      return;
    }

    setCargando(true);
    try {
      const s = await AuthService.registro({
        nombre,
        apellido,
        email,
        telefono,
        password,
      });
      login(s);

      mostrar("¡Cuenta creada! Bienvenido.", "success");
      navigate("/reservar");
    } catch (err) {
      mostrar((err as Error).message || "Error al crear la cuenta", "error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-5">
          <label
            htmlFor="reg-nombre"
            className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
          >
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-nombre"
            type="text"
            className={inputCls(errs.nombre)}
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
          />
          <FieldError msg={errs.nombre} />
        </div>
        <div className="mb-5">
          <label
            htmlFor="reg-apellido"
            className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
          >
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-apellido"
            type="text"
            className={inputCls(errs.apellido)}
            value={form.apellido}
            onChange={(e) => set("apellido", e.target.value)}
          />
          <FieldError msg={errs.apellido} />
        </div>
      </div>
      <div className="mb-5">
        <label
          htmlFor="reg-email"
          className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          className={inputCls(errs.email)}
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <FieldError msg={errs.email} />
      </div>
      <div className="mb-5">
        <label
          htmlFor="reg-telefono"
          className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
        >
          Teléfono <span className="text-red-500">*</span>
        </label>
        <input
          id="reg-telefono"
          type="tel"
          className={inputCls(errs.telefono)}
          placeholder="1123456789"
          value={form.telefono}
          onChange={(e) => set("telefono", e.target.value)}
        />
        <FieldError msg={errs.telefono} />
      </div>
      <div className="mb-5">
        <label
          htmlFor="reg-password"
          className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
        >
          Contraseña <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            className={`${inputCls(errs.password)} pr-10`}
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        </div>
        <FieldError msg={errs.password} />
      </div>
      <div className="mb-5">
        <label
          htmlFor="reg-password-confirm"
          className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]"
        >
          Confirmar Contraseña <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password-confirm"
            type={showPasswordConfirm ? "text" : "password"}
            className={`${inputCls(errs.passwordConfirm)} pr-10`}
            placeholder="Repetí tu contraseña"
            value={form.passwordConfirm}
            onChange={(e) => set("passwordConfirm", e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPasswordConfirm((v) => !v)}
          >
            {showPasswordConfirm ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        </div>
        <FieldError msg={errs.passwordConfirm} />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block btn-large mt-3"
        disabled={cargando}
      >
        {cargando ? (
          "Creando cuenta…"
        ) : (
          <>
            {" "}
            Crear Cuenta <LuArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
