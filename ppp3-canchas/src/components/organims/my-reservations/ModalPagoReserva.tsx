import { Modal, Spinner } from "@/components/atoms";
import { PagoForm } from "@/components/organims/pagos";
import { usePagosReserva } from "@/hooks";
import { DateUtils, MoneyUtils } from "@/utils";
import { TIPO_LABEL, METODO_LABEL } from "@/mock";
import type { Reserva } from "@/types";

interface Props {
  reserva: Reserva;
  onClose: () => void;
  onPagado: () => void;
}

export function ModalPagoReserva({ reserva, onClose, onPagado }: Props) {
  const { data, loading, recargar } = usePagosReserva(reserva.id);
  const saldoPendiente = data?.saldoPendiente ?? null;
  const pagado = saldoPendiente != null && saldoPendiente <= 0;

  return (
    <Modal titulo={`Pago · Reserva #${reserva.id}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          {data && data.pagos.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[13px] font-bold text-slate-800 mb-2">Pagos registrados</h4>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {data.pagos.map((p) => {
                  const { fecha, hora } = DateUtils.formatearFechaHora(p.fechaPago)
                  return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2.5 text-[13px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-700">
                        {TIPO_LABEL[p.tipoPago] ?? p.tipoPago}
                      </span>
                      <span className="text-slate-400">
                        {" · "}
                        {METODO_LABEL[p.metodoPago] ?? p.metodoPago}
                        {" · "}
                        {fecha}
                        {" "}
                        <span className="text-slate-300">·</span>
                        {" "}
                        {hora}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700">
                      {MoneyUtils.formatear(p.monto)}
                    </span>
                  </li>
                  )
                })}
              </ul>
            </div>
          )}
          {pagado ? (
            <div className="px-4 py-3.5 rounded-xl text-[13.5px] border bg-emerald-50 text-emerald-800 border-emerald-200">
              Esta reserva ya está pagada en su totalidad.
            </div>
          ) : (
            <PagoForm
              reservaId={reserva.id}
              senaRequerida={reserva.senaRequerida ?? 0}
              precioTotal={reserva.precioTotal}
              saldoPendiente={saldoPendiente}
              onPagado={() => {
                recargar();
                onPagado();
              }}
            />
          )}
        </>
      )}
    </Modal>
  );
}
