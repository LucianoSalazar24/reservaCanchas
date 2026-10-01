export function Spinner({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="flex flex-col items-center justify-end gap-1.5 h-22.5">
        <span className="text-[2.8rem] leading-none animate-soccer-bounce">⚽</span>
        <span className="w-9.5 h-2 bg-black/20 rounded-full animate-soccer-shadow" />
      </div>
      {texto && <p className="text-slate-400 text-sm font-medium">{texto}</p>}
    </div>
  )
}
