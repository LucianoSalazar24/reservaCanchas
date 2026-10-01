export const CLIENTES_HEADERS = [
  "Nombre",
  "Teléfono",
  "Email",
  "Tipo",
  "Reservas",
  "Descuento",
  "Estado",
  "",
];

// Catálogo fijo de tipos de cliente (espejo de la tabla tipos_cliente del seed).
export const TIPOS_CLIENTE = [
  { id: 1, nombre: "Regular", descuento: 0 },
  { id: 2, nombre: "Frecuente", descuento: 10 },
  { id: 3, nombre: "VIP", descuento: 20 },
] as const;

// "VIP (20%)" — o "—" si no hay tipo o el id es desconocido.
export function tipoClienteLabel(id?: number): string {
  const t = TIPOS_CLIENTE.find((x) => x.id === id);
  return t ? `${t.nombre} (${t.descuento}%)` : "—";
}
