import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ titulo, children, onClose, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-[2000] p-4 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-3xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-[var(--shadow-modal)] animate-scale-in"
      >
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex justify-between items-center">
          <h3 id="modal-title" className="m-0 text-[16px] font-bold text-slate-900">{titulo}</h3>
          <button
            aria-label="Cerrar"
            className="bg-slate-100 border-none w-7 h-7 rounded-full flex items-center justify-center text-sm cursor-pointer text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-800"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6 pt-5 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
