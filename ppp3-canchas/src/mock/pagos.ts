import { LuBanknote, LuCreditCard, LuArrowLeftRight } from "react-icons/lu";
import type { MetodoPago, TipoPago } from "@/types";

export const METODO_ICON: Record<
  MetodoPago,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  efectivo: LuBanknote,
  tarjeta: LuCreditCard,
  transferencia: LuArrowLeftRight,
};

export const METODO_COLOR: Record<MetodoPago, string> = {
  efectivo: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  tarjeta: "bg-sky-50 text-sky-700 ring-sky-200/60",
  transferencia: "bg-purple-50 text-purple-700 ring-purple-200/60",
};

export const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

export const TIPO_COLOR: Record<TipoPago, string> = {
  seña: "bg-amber-50 text-amber-700 ring-amber-200/60",
  saldo: "bg-blue-50 text-blue-700 ring-blue-200/60",
  completo: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  devolucion: "bg-red-50 text-red-700 ring-red-200/60",
};

export const TIPO_LABEL: Record<TipoPago, string> = {
  seña: "Seña",
  saldo: "Saldo",
  completo: "Completo",
  devolucion: "Devolución",
};

export const PAGOS_HEADERS = [
  "Fecha",
  "Hora",
  "Reserva",
  "Tipo",
  "Método",
  "Monto",
  "Observaciones",
];
