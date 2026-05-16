import { useEffect, useState } from 'react';
import { CreditCard, Mail, QrCode, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
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

export default function FormularioPasajeros({
  cantidadPasajes,
  asientosSeleccionados,
  metodoPago,
  setMetodoPago,
  correoComprobante,
  setCorreoComprobante,
  precio,
  onConfirmar
}) {
  const [pasajeros, setPasajeros] = useState([]);
  const [modal, setModal] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const total = Number(precio) * cantidadPasajes;

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
      setModal({
        tipo: 'qr',
        titulo: 'Pago por QR',
        mensaje: 'Escanea el código QR para simular el pago.'
      });
      return;
    }

    if (metodoPago === 'Tarjeta') {
      setModal({
        tipo: 'tarjeta',
        titulo: 'Pago con tarjeta',
        mensaje: 'Completa los datos para simular la pasarela de pago.'
      });
    }
  }

  async function confirmarCompraFinal() {
    setProcesando(true);

    try {
      await onConfirmar(pasajeros);
      setModal({
        tipo: 'success',
        titulo: 'Compra realizada',
        mensaje: 'Tus boletos fueron generados correctamente.'
      });
    } catch (error) {
      setModal({
        tipo: 'error',
        titulo: 'No se pudo completar la compra',
        mensaje: error.message || 'Ocurrió un error inesperado.'
      });
    } finally {
      setProcesando(false);
    }
  }

  return (
    <>
      <form onSubmit={iniciarPago} className="rounded-3xl! bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 rounded-3xl! bg-gradient-to-r from-teal-900 to-teal-700 p-5 text-white">
          <p className="text-sm font-semibold text-teal-100">Resumen de compra</p>
          <h2 className="mt-1 text-3xl font-black">Bs. {total}</h2>
          <p className="mt-1 text-sm text-teal-100">
            {cantidadPasajes} pasaje(s) · Asientos {asientosSeleccionados.join(', ') || '-'}
          </p>
        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600">
              <Mail size={18} /> Correo comprobante
            </span>
            <input
              type="email"
              value={correoComprobante}
              onChange={e => setCorreoComprobante(e.target.value)}
              className="w-full rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
              placeholder="correo@ejemplo.com"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-bold text-slate-600">
              Método de pago
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago('QR')}
                className={`rounded-2xl! border p-4 text-left transition ${
                  metodoPago === 'QR'
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <QrCode size={24} />
                <p className="mt-2 font-black">QR</p>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('Tarjeta')}
                className={`rounded-2xl! border p-4 text-left transition ${
                  metodoPago === 'Tarjeta'
                    ? 'border-teal-700 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <CreditCard size={24} />
                <p className="mt-2 font-black">Tarjeta</p>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {pasajeros.map((pasajero, index) => (
            <div key={index} className="rounded-3xl! border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-slate-800">Pasajero {index + 1}</h3>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">
                  Asiento {asientosSeleccionados[index] || '-'}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  value={pasajero.nombre_pasajero}
                  onChange={e => cambiarPasajero(index, 'nombre_pasajero', e.target.value)}
                  className="rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                  placeholder="Nombre completo"
                />

                <input
                  required
                  value={pasajero.ci_pasajero}
                  onChange={e => cambiarPasajero(index, 'ci_pasajero', e.target.value)}
                  className="rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                  placeholder="CI pasajero"
                />
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={pasajero.es_menor}
                  onChange={e => cambiarPasajero(index, 'es_menor', e.target.checked)}
                />
                Es menor de edad
              </label>

              {pasajero.es_menor && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    required
                    value={pasajero.nombre_tutor}
                    onChange={e => cambiarPasajero(index, 'nombre_tutor', e.target.value)}
                    className="rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                    placeholder="Nombre tutor"
                  />

                  <input
                    required
                    value={pasajero.ci_tutor}
                    onChange={e => cambiarPasajero(index, 'ci_tutor', e.target.value)}
                    className="rounded-2xl! border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                    placeholder="CI tutor"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl! bg-teal-800 px-6 py-4 font-black text-white shadow hover:bg-teal-700">
          <ShieldCheck size={22} />
          Continuar con el pago
        </button>
      </form>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl! bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-teal-900">{modal.titulo}</h3>
              <button onClick={() => setModal(null)} className="rounded-full p-2 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            {modal.tipo === 'qr' && (
              <div className="text-center">
                <div className="mx-auto mb-4 inline-block rounded-3xl! border border-slate-200 bg-white p-4">
                  <QRCodeCanvas
                    value={`ViaGo|Monto:${total}|Asientos:${asientosSeleccionados.join(',')}`}
                    size={210}
                  />
                </div>

                <p className="mb-4 text-sm font-semibold text-slate-600">
                  Monto a pagar: <strong>Bs. {total}</strong>
                </p>

                <button
                  onClick={confirmarCompraFinal}
                  disabled={procesando}
                  className="w-full rounded-2xl! bg-teal-800 px-5 py-3 font-black text-white hover:bg-teal-700 disabled:opacity-70"
                >
                  {procesando ? 'Procesando...' : 'Ya pagué, confirmar compra'}
                </button>
              </div>
            )}

            {modal.tipo === 'tarjeta' && (
              <div className="grid gap-3">
                <input className="rounded-2xl! border border-slate-200 px-4 py-3" placeholder="Número de tarjeta" />
                <div className="grid grid-cols-2 gap-3">
                  <input className="rounded-2xl! border border-slate-200 px-4 py-3" placeholder="MM/AA" />
                  <input className="rounded-2xl! border border-slate-200 px-4 py-3" placeholder="CVV" />
                </div>
                <input className="rounded-2xl! border border-slate-200 px-4 py-3" placeholder="Nombre del titular" />

                <button
                  onClick={confirmarCompraFinal}
                  disabled={procesando}
                  className="mt-2 w-full rounded-2xl! bg-teal-800 px-5 py-3 font-black text-white hover:bg-teal-700 disabled:opacity-70"
                >
                  {procesando ? 'Procesando...' : `Pagar Bs. ${total}`}
                </button>
              </div>
            )}

            {modal.tipo === 'error' && (
              <p className="rounded-2xl! bg-red-50 p-4 font-semibold text-red-700">
                {modal.mensaje}
              </p>
            )}

            {modal.tipo === 'success' && (
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-teal-700" />
                <p className="font-semibold text-slate-600">{modal.mensaje}</p>
                <button
                  onClick={() => setModal(null)}
                  className="mt-5 w-full rounded-2xl! bg-teal-800 px-5 py-3 font-black text-white"
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}