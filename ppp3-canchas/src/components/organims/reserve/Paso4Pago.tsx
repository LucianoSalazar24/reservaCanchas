import { useNavigate } from "react-router-dom";
import { MoneyUtils } from "@/utils";
import { useAlert } from "@/components";
import { PagoForm } from "@/components/organims/pagos";
import type { Reserva } from "@/types";

interface Props {
  reserva: Reserva;
}

export function Paso4Pago({ reserva }: Props) {
  const navigate = useNavigate();
  const { mostrar, AlertComponent } = useAlert();

  function irAMisReservas() {
    navigate("/mis-reservas");
  }

  function pagarMasTarde() {
    mostrar("Reserva guardada como pendiente. Podés pagar la seña más tarde.", "info");
    irAMisReservas();
  }

  return (
    <div className="p-6">
      {AlertComponent}
      <h2 className="text-lg font-bold text-slate-900 mb-1">Paso 4: Pago de la seña</h2>
      <p className="text-sm text-slate-400 mb-6">
        Pagá la seña para <strong className="text-slate-600">confirmar</strong> tu reserva. La reserva
        ya quedó registrada como pendiente.
      </p>

      <div className="text-center mb-6 py-5 rounded-2xl bg-brand-50 border border-brand-100">
        <p className="text-[13px] text-brand-700 font-semibold mb-1">Total de la reserva</p>
        <p className="text-4xl font-extrabold text-brand-700 tracking-tight leading-none">
          {MoneyUtils.formatear(reserva.precioTotal)}
        </p>
        <p className="text-[12.5px] text-slate-400 mt-2">
          Seña requerida:{" "}
          <strong className="text-slate-600">
            {MoneyUtils.formatear(reserva.senaRequerida ?? 0)}
          </strong>
        </p>
      </div>

      <PagoForm
        reservaId={reserva.id}
        senaRequerida={reserva.senaRequerida ?? 0}
        precioTotal={reserva.precioTotal}
        onPagado={() => {
          mostrar("¡Pago registrado! Tu reserva quedó confirmada.", "success");
          irAMisReservas();
        }}
        textoBoton="Pagar seña (simular)"
      />

      <div className="flex justify-center mt-5 pt-4 border-t border-slate-100">
        <button type="button" className="btn btn-outline" onClick={pagarMasTarde}>
          Pagar más tarde
        </button>
      </div>
    </div>
  );
}
