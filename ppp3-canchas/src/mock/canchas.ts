export const CAPACITY_LABEL: Record<number, string> = {
  22: "Fútbol 11",
  14: "Fútbol 7",
  10: "Fútbol 5",
};

export const CAPACITY_COLOR: Record<number, string> = {
  22: "from-emerald-900 to-emerald-700",
  14: "from-teal-900 to-teal-700",
  10: "from-cyan-900 to-cyan-700",
};

export const FORM_CANCHA_VACIO = {
  nombre: "",
  capacidad: 22,
  precioPorHora: 0,
  descripcion: "",
};

export const FORM_CANCHA_ERRORS_EMPTY = {
  nombre: "",
  precioPorHora: "",
};
