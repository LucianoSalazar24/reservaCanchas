import {
  LuAlarmClock,
  LuPhoneCall,
  LuPin,
  LuCalendar,
  LuZap,
  LuDollarSign,
  LuStar,
} from "react-icons/lu";

export const CARDS = [
  {
    icon: <LuPin className="text-red-500" />,
    color: "bg-red-50 text-red-600 ring-red-100",
    title: "Ubicación",
    lines: ["Buenos Aires, Argentina"],
  },
  {
    icon: <LuAlarmClock className="text-red-500" />,
    color: "bg-amber-50 text-amber-600 ring-amber-100",
    title: "Horarios",
    lines: ["Lunes a Domingo", "08:00 – 23:00"],
  },
  {
    icon: <LuPhoneCall className="text-slate-700" />,
    color: "bg-brand-50 text-brand-700 ring-brand-100",
    title: "Contacto",
    lines: ["(011) 1234-5678", "reservas@futbolreservas.ar"],
  },
];

export const FEATURES = [
  {
    Icon: LuCalendar,
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    title: "Reserva Online",
    desc: "Reservá desde cualquier lugar, las 24 horas. Sin necesidad de llamar.",
  },
  {
    Icon: LuZap,
    color: "bg-amber-50 text-amber-600 ring-amber-200",
    title: "Confirmación Inmediata",
    desc: "Obtené confirmación instantánea. Sin esperas ni confusiones.",
  },
  {
    Icon: LuDollarSign,
    color: "bg-sky-50 text-sky-700 ring-sky-200",
    title: "Descuentos por Frecuencia",
    desc: "Clientes frecuentes obtienen descuentos especiales de forma automática.",
  },
  {
    Icon: LuStar,
    color: "bg-purple-50 text-purple-700 ring-purple-200",
    title: "Canchas de Calidad",
    desc: "Césped sintético de última generación, perfectamente mantenido.",
  },
];

export const STEPS = [
  {
    title: "Elegí tu Cancha",
    desc: "Seleccioná la cancha que mejor se adapte a tus necesidades",
  },
  {
    title: "Seleccioná Fecha y Horario",
    desc: "Verificá la disponibilidad y elegí el horario que prefieras",
  },
  {
    title: "Completá tus Datos",
    desc: "Ingresá tu información de contacto en segundos",
  },
  {
    title: "Confirmá y Jugá",
    desc: "Recibí tu confirmación y disfrutá del partido",
  },
];
