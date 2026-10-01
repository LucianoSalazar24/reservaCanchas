import {
  LuChartBarIncreasing,
  LuCalendar,
  LuUsers,
  LuLayoutGrid,
  LuReceiptText,
} from "react-icons/lu";

export type TabAdmin =
  | "dashboard"
  | "reservas"
  | "clientes"
  | "canchas"
  | "pagos";

export const ADMIN_TABS: {
  id: TabAdmin;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", Icon: LuChartBarIncreasing },
  { id: "reservas", label: "Reservas", Icon: LuCalendar },
  { id: "clientes", label: "Clientes", Icon: LuUsers },
  { id: "canchas", label: "Canchas", Icon: LuLayoutGrid },
  { id: "pagos", label: "Pagos", Icon: LuReceiptText },
];
