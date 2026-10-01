import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/context'
import { useAlert } from '@/components'
import { LuShieldCheck } from "react-icons/lu";
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type Tab = 'login' | 'registro'

export function LoginPage() {
  const { sesion, isAdmin } = useAuth()
  const { mostrar, AlertComponent } = useAlert()
  const [tab, setTab] = useState<Tab>('login')

  if (sesion) return <Navigate to={isAdmin ? '/admin' : '/reservar'} replace />

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {AlertComponent}

      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(135deg,#022c22 0%,#064e3b 50%,#065f46 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="w-full max-w-[440px] z-10 py-8">
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="bg-gradient-to-br from-brand-900 to-brand-700 px-8 py-7 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 border border-white/25 rounded-2xl mb-4 text-3xl">
              ⚽
            </div>
            <h1 className="text-white text-xl font-extrabold tracking-tight mb-1">FutbolReservas</h1>
            <p className="text-white/60 text-xs font-medium">Sistema de Reservas de Canchas</p>
          </div>

          <div className="px-6 sm:px-7 py-7">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
              {(['login', 'registro'] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200 border-none cursor-pointer font-[inherit]
                    ${tab === t ? 'bg-white text-brand-700 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-700'}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>
              ))}
            </div>

            {tab === 'login' && <LoginForm mostrar={mostrar} />}
            {tab === 'registro' && <RegisterForm mostrar={mostrar} />}

            <div className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-[12px]">
              <LuShieldCheck size={12} className="text-brand-400" /> Tus datos están protegidos y seguros
            </div>
            <div className="text-center mt-4 pt-4 border-t border-slate-100">
              <Link to="/" className="text-slate-400 hover:text-brand-600 text-[13px] transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
