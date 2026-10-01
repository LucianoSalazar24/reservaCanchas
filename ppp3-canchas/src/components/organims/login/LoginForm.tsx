import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { AuthService } from '@/services'
import { LuArrowRight, LuEye, LuEyeOff } from "react-icons/lu";
import { FieldError, inputCls } from '@/components/atoms'
import { LOGIN_INITIAL } from '@/mock'

interface LoginFormProps {
  mostrar: (msg: string, tipo: 'success' | 'error' | 'warning' | 'info') => void
}

type LoginErrors = { email: string; password: string }

export function LoginForm({ mostrar }: LoginFormProps) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState(LOGIN_INITIAL)
  const [errs, setErrs] = useState<LoginErrors>(LOGIN_INITIAL)
  const [showPassword, setShowPassword] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = { ...LOGIN_INITIAL }
    if (!form.email) next.email = 'El email es requerido'
    if (!form.password) next.password = 'La contraseña es requerida'
    if (next.email || next.password) { setErrs(next); return }

    setCargando(true)
    try {
      const s = await AuthService.login(form.email, form.password)
      login(s)
      mostrar('¡Bienvenido!', 'success')
      navigate(s.rol === 'admin' ? '/admin' : '/reservar')
    } catch (err) {
      mostrar((err as Error).message || 'Email o contraseña incorrectos', 'error')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit} noValidate>
      <div className="mb-5">
        <label htmlFor="login-email" className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Email</label>
        <input
          id="login-email"
          type="email"
          className={inputCls(errs.email)}
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        <FieldError msg={errs.email} />
      </div>
      <div className="mb-5">
        <label htmlFor="login-password" className="block mb-1.5 text-[13px] font-semibold text-slate-800 tracking-[0.01em]">Contraseña</label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className={`${inputCls(errs.password)} pr-10`}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        </div>
        <FieldError msg={errs.password} />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block btn-large mt-3"
        disabled={cargando}
      >
        {cargando ? 'Iniciando sesión…' : <> Iniciar Sesión <LuArrowRight size={16} /></>}
      </button>     
    </form>
  )
}
