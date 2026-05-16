import { Check, FileText, Mail, X } from 'lucide-react';

export default function ModalCompraExitosa({
  abierto,
  onCerrar,
  boletos = [],
  correoEnviado,
  onVerPDF
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-[bounce_0.45s_ease-out] rounded-[2rem] bg-white p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onCerrar}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mx-auto mb-5 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-teal-50">
          <div className="flex h-16 w-16 scale-100 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition duration-500">
            <Check size={42} strokeWidth={4} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-teal-900">
          ¡Compra exitosa!
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Tus boletos fueron generados correctamente.
        </p>

        <div className="mt-5 rounded-2xl! bg-slate-50 p-4 text-left">
          <p className="mb-2 text-xs font-black uppercase text-slate-400">
            Boletos generados
          </p>

          <div className="space-y-2">
            {boletos.map(boleto => (
              <div
                key={boleto.id_boleto}
                className="flex items-center justify-between rounded-xl! bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
              >
                <span className="font-bold text-slate-700">
                  Asiento {boleto.asiento}
                </span>
                <span className="font-black text-teal-800">
                  {boleto.codigo_boleto}
                </span>
              </div>
            ))}
          </div>
        </div>

        {correoEnviado && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl! bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800">
            <Mail size={18} />
            Comprobante enviado al correo
          </div>
        )}

        <div className="mt-5 grid gap-3">
          {onVerPDF && (
            <button
              type="button"
              onClick={onVerPDF}
              className="flex w-full items-center justify-center gap-2 rounded-2xl! bg-slate-100 px-5 py-3 font-black text-slate-700 hover:bg-slate-200"
            >
              <FileText size={20} />
              Ver comprobante PDF
            </button>
          )}

          <button
            type="button"
            onClick={onCerrar}
            className="w-full rounded-2xl! bg-teal-800 px-5 py-3 font-black text-white shadow hover:bg-teal-700"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}