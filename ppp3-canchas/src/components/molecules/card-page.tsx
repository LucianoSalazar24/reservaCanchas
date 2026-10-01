import { Link } from "react-router-dom";
import { useAuth } from "@/context";

export function CardPage({
  code,
  title,
  description,
  accentClassName,
  src,
}: {
  code: number;
  title: string;
  description: string;
  accentClassName: string;
  src: string;
}) {
  const { sesion, isAdmin } = useAuth();
  const home = !sesion ? "/login" : isAdmin ? "/admin" : "/";
  const homeLabel = !sesion ? "Iniciar sesión" : "Volver al inicio";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 select-none"
      style={{
        background: "linear-gradient(155deg, #0f172a 0%, #042f1e 100%)",
      }}
    >
      <style>{`
        @keyframes nf-raise {
          0%   { transform: translateY(110px); opacity: 0; }
          55%  { opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        @keyframes nf-sway {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(0) rotate(5deg); }
        }
        @keyframes nf-fade-up {
          0%   { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        .nf-arm {
          transform-origin: 50% 100%;
          animation:
            nf-raise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both,
            nf-sway  2.8s ease-in-out 1.2s infinite;
        }
        .nf-text-1 { animation: nf-fade-up 0.5s ease-out 1.0s both; }
        .nf-text-2 { animation: nf-fade-up 0.5s ease-out 1.2s both; }
        .nf-text-3 { animation: nf-fade-up 0.5s ease-out 1.35s both; }
        .nf-text-4 { animation: nf-fade-up 0.5s ease-out 1.5s both; }
      `}</style>

      <img
        src={src}
        alt="Tarjeta"
        className="nf-arm mb-8"
        style={{ width: 500, height: "auto" }}
      />
      <p className="nf-text-1 text-[88px] font-black text-white leading-none tracking-tighter mb-1">
        {code}
      </p>
      <h1 className={`nf-text-2 text-2xl font-bold mb-3 ${accentClassName}`}>
        {title}
      </h1>
      <p className="nf-text-3 text-slate-400 text-base text-center mb-8 max-w-xs leading-relaxed">
        {description}
      </p>
      <div className="nf-text-4">
        <Link
          to={home}
          className="inline-block bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-[15px]"
        >
          {!sesion ? `${homeLabel} →` : `← ${homeLabel}`}
        </Link>
      </div>
    </div>
  );
}
