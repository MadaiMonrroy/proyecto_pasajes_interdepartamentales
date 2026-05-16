import { useEffect, useState } from 'react';
import {
  Banknote,
  Mail,
  QrCode,
  ShieldCheck,
  X,
  CheckCircle2,
  Printer,
  Calculator
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

function pasajeroVacio() {
  return {
    nombre_pasajero: '',
    ci_pasajero: '',
    es_menor: false,
    nombre_tutor: '',
    ci_tutor: ''
  };
}

export default function FormularioPasajerosEncargado({
  cantidadPasajes,
  asientosSeleccionados,
  metodoPago,
  setMetodoPago,
  correoComprobante,
  setCorreoComprobante,
  precio,
  onConfirmar
}) {
  const [pasajeros, setPasajeros]   = useState([]);
  const [modal, setModal]           = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Para efectivo: monto recibido
  const [montoRecibido, setMontoRecibido] = useState('');

  const total   = Number(precio) * cantidadPasajes;
  const vuelto  = montoRecibido ? Math.max(0, Number(montoRecibido) - total).toFixed(2) : null;

  useEffect(() => {
    setPasajeros(prev =>
      Array.from({ length: cantidadPasajes }, (_, i) => prev[i] || pasajeroVacio())
    );
  }, [cantidadPasajes]);

  function cambiarPasajero(index, campo, valor) {
    const copia = [...pasajeros];
    copia[index] = { ...copia[index], [campo]: valor };
    setPasajeros(copia);
  }

  function validar() {
    if (asientosSeleccionados.length !== cantidadPasajes) {
      setModal({
        tipo: 'error',
        titulo: 'Asientos incompletos',
        mensaje: `Debe seleccionar ${cantidadPasajes} asiento(s) antes de continuar.`
      });
      return false;
    }
    return true;
  }

  function iniciarPago(e) {
    e.preventDefault();
    if (!validar()) return;

    if (metodoPago === 'QR') {
      setModal({ tipo: 'qr', titulo: 'Pago por QR' });
    } else {
      setModal({ tipo: 'efectivo', titulo: 'Cobro en efectivo' });
    }
  }

  function imprimirPDF(base64) {
    const byteCharacters = atob(base64);
    const byteNumbers    = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray      = new Uint8Array(byteNumbers);
    const blob           = new Blob([byteArray], { type: 'application/pdf' });
    const url            = URL.createObjectURL(blob);

    // Abrir e imprimir automáticamente
    const ventana = window.open(url, '_blank');
    if (ventana) {
      ventana.addEventListener('load', () => {
        ventana.focus();
        ventana.print();
      });
    }
  }

  async function confirmarCompraFinal() {
    setProcesando(true);
    try {
      const data = await onConfirmar(pasajeros);
      setModal({
        tipo: 'success',
        titulo: 'Venta realizada',
        pdfBase64: data?.comprobante_pdf || null,
        boletos: data?.boletos || []
      });
    } catch (error) {
      setModal({
        tipo: 'error',
        titulo: 'Error en la venta',
        mensaje: error.message || 'Ocurrió un error inesperado.'
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <form onSubmit={iniciarPago} className="rounded-3xl! bg-white p-5 shadow-sm ring-1 ring-slate-200">

        {/* Resumen */}
        <div className="mb-5 rounded-2xl! bg-teal-900 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
            Resumen de venta
          </p>
          <p className="mt-1 text-3xl font-black">Bs. {total}</p>
          <p className="mt-0.5 text-sm text-teal-200">
            {cantidadPasajes} pasaje(s) · Asientos:{' '}
            {asientosSeleccionados.length > 0 ? asientosSeleccionados.join(', ') : '—'}
          </p>
        </div>

        {/* Método de pago — solo QR y Efectivo */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-bold text-slate-600">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodoPago('QR')}
              className={`flex items-center gap-3 rounded-2xl! border p-4 transition ${
                metodoPago === 'QR'
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <QrCode size={22} />
              <span className="font-bold">QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoPago('Efectivo')}
              className={`flex items-center gap-3 rounded-2xl! border p-4 transition ${
                metodoPago === 'Efectivo'
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <Banknote size={22} />
              <span className="font-bold">Efectivo</span>
            </button>
          </div>
        </div>

        {/* Si es efectivo: monto recibido */}
        {metodoPago === 'Efectivo' && (
          <div className="mb-5 rounded-2xl! border border-slate-200 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
              <Calculator size={16} /> Calcular vuelto
            </p>
            <input
              type="number"
              min={total}
              step="0.01"
              value={montoRecibido}
              onChange={e => setMontoRecibido(e.target.value)}
              placeholder={`Mínimo Bs. ${total}`}
              className="w-full rounded-xl! border border-slate-200 px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-teal-500"
            />
            {vuelto !== null && Number(montoRecibido) >= total && (
              <div className="mt-3 flex items-center justify-between rounded-xl! bg-teal-50 px-4 py-3">
                <span className="text-sm font-semibold text-teal-700">Vuelto a devolver:</span>
                <span className="text-xl font-black text-teal-800">Bs. {vuelto}</span>
              </div>
            )}
            {vuelto !== null && Number(montoRecibido) < total && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                El monto es menor al total de Bs. {total}
              </p>
            )}
          </div>
        )}

        {/* Correo comprobante (opcional) */}
        <div className="mb-5 ">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
            <Mail size={16} /> 
          <label className=" text-sm font-bold text-slate-600">
            Correo para comprobante (opcional)  
          </label>
          </div>
          <input
            type="email"
            value={correoComprobante}
            onChange={e => setCorreoComprobante(e.target.value)}
            className="w-full rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            placeholder="correo@ejemplo.com"
          />
        </div>

        {/* Datos pasajeros */}
        <div className="mb-5 grid gap-4">
          {pasajeros.map((pasajero, index) => (
            <div key={index} className="rounded-2xl! border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-black text-slate-800">Pasajero {index + 1}</p>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                  Asiento {asientosSeleccionados[index] ?? '—'}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={pasajero.nombre_pasajero}
                  onChange={e => cambiarPasajero(index, 'nombre_pasajero', e.target.value)}
                  className="rounded-xl! border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  placeholder="Nombre completo"
                />
                <input
                  required
                  value={pasajero.ci_pasajero}
                  onChange={e => cambiarPasajero(index, 'ci_pasajero', e.target.value)}
                  className="rounded-xl! border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  placeholder="CI del pasajero"
                />
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pasajero.es_menor}
                  onChange={e => cambiarPasajero(index, 'es_menor', e.target.checked)}
                  className="accent-teal-700"
                />
                Es menor de edad
              </label>

              {pasajero.es_menor && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={pasajero.nombre_tutor}
                    onChange={e => cambiarPasajero(index, 'nombre_tutor', e.target.value)}
                    className="rounded-xl! border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    placeholder="Nombre del tutor"
                  />
                  <input
                    required
                    value={pasajero.ci_tutor}
                    onChange={e => cambiarPasajero(index, 'ci_tutor', e.target.value)}
                    className="rounded-xl! border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                    placeholder="CI del tutor"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl! bg-teal-800 py-4 font-black text-white shadow transition hover:bg-teal-700"
        >
          <ShieldCheck size={20} />
          Continuar con el pago
        </button>
      </form>

      {/* ── Modales ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl! bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-teal-900">{modal.titulo}</h3>
              {modal.tipo !== 'success' && (
                <button
                  onClick={() => setModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* QR */}
            {modal.tipo === 'qr' && (
              <div className="text-center">
                <div className="mx-auto mb-4 inline-block rounded-2xl! border border-slate-200 bg-white p-4">
                  <QRCodeCanvas
                    value={`ViaGo|Monto:${total}|Asientos:${asientosSeleccionados.join(',')}`}
                    size={200}
                  />
                </div>
                <p className="mb-1 text-sm font-semibold text-slate-600">
                  Monto a cobrar
                </p>
                <p className="mb-5 text-2xl font-black text-teal-800">Bs. {total}</p>
                <button
                  onClick={confirmarCompraFinal}
                  disabled={procesando}
                  className="w-full rounded-2xl! bg-teal-800 py-3 font-black text-white hover:bg-teal-700 disabled:opacity-70"
                >
                  {procesando ? 'Procesando...' : 'Confirmar pago recibido'}
                </button>
              </div>
            )}

            {/* Efectivo */}
            {modal.tipo === 'efectivo' && (
              <div>
                <div className="mb-5 rounded-2xl! bg-teal-50 p-4">
                  <div className="flex justify-between text-sm font-semibold text-teal-800">
                    <span>Total a cobrar:</span>
                    <span className="text-xl font-black">Bs. {total}</span>
                  </div>
                  {montoRecibido && Number(montoRecibido) >= total && (
                    <div className="mt-2 flex justify-between border-t border-teal-200 pt-2 text-sm font-semibold text-teal-700">
                      <span>Vuelto:</span>
                      <span className="font-black">Bs. {vuelto}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={confirmarCompraFinal}
                  disabled={procesando}
                  className="w-full rounded-2xl! bg-teal-800 py-3 font-black text-white hover:bg-teal-700 disabled:opacity-70"
                >
                  {procesando ? 'Procesando...' : 'Confirmar cobro y registrar venta'}
                </button>
              </div>
            )}

            {/* Error */}
            {modal.tipo === 'error' && (
              <>
                <p className="rounded-2xl! bg-red-50 p-4 font-semibold text-red-700">
                  {modal.mensaje}
                </p>
                <button
                  onClick={() => setModal(null)}
                  className="mt-4 w-full rounded-2xl! bg-slate-100 py-3 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </>
            )}

            {/* Éxito con imprimir */}
            {modal.tipo === 'success' && (
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-teal-600" />
                <p className="mb-1 text-lg font-black text-slate-800">
                  ¡Venta completada!
                </p>
                <p className="mb-2 text-sm text-slate-500">
                  Boletos: {modal.boletos?.map(b => b.codigo_boleto).join(', ')}
                </p>

                {modal.pdfBase64 && (
                  <button
                    onClick={() => imprimirPDF(modal.pdfBase64)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl! bg-teal-800 py-3 font-black text-white hover:bg-teal-700"
                  >
                    <Printer size={20} />
                    Imprimir comprobante
                  </button>
                )}

                <button
                  onClick={() => setModal(null)}
                  className="w-full rounded-2xl! bg-slate-100 py-3 font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}