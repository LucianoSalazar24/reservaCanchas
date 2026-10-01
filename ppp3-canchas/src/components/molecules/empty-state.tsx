import type { ReactNode } from "react";

export function EmptyState({
  icono,
  titulo,
  descripcion,
  accion,
  variant = "card",
  className = "",
}: {
  icono?: string;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  variant?: "card" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={`text-center text-slate-400 text-[13px] ${className}`}>
        {titulo}
      </p>
    );
  }

  return (
    <div
      className={`text-center py-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-3 ${className}`}
    >
      {icono && <span className="text-4xl">{icono}</span>}
      <p className="text-slate-500 font-medium">{titulo}</p>
      {descripcion && (
        <p className="text-slate-400 text-sm max-w-xs">{descripcion}</p>
      )}
      {accion}
    </div>
  );
}
