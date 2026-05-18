import { useState } from 'react';
import { MapPin, Loader2, ArrowLeftRight, X, BusFront, Armchair } from 'lucide-react';

const departamentos = [
  { nombre: 'La Paz',     sigla: 'LPZ' },
  { nombre: 'Cochabamba', sigla: 'CBB' },
  { nombre: 'Santa Cruz', sigla: 'SCZ' },
];

function getDepartamento(nombre) {
  return departamentos.find(d => d.nombre === nombre);
}

export default function SelectorRuta({
  origen,
  destino,
  fecha,
  cantidadPasajes,
  setOrigen,
  setDestino,
  setFecha,
  setCantidadPasajes,
  onBuscar,
  buscando
}) {
  const [modalTipo, setModalTipo] = useState(null);

  const origenData  = getDepartamento(origen);
  const destinoData = getDepartamento(destino);

  function invertirRuta() {
    setOrigen(destino);
    setDestino(origen);
  }

  function seleccionarDepartamento(dep) {
    if (modalTipo === 'origen')  setOrigen(dep.nombre);
    if (modalTipo === 'destino') setDestino(dep.nombre);
    setModalTipo(null);
  }
function seleccionarDepartamento(dep) {
  if (modalTipo === 'origen') {
    setOrigen(dep.nombre);
    if (destino === dep.nombre) setDestino('');
  }
  if (modalTipo === 'destino') {
    setDestino(dep.nombre);
    if (origen === dep.nombre) setOrigen('');
  }
  setModalTipo(null);
}
  return (
    <>
      <form onSubmit={onBuscar} className="bg-white px-3 py-4 sm:px-6 sm:py-6">

        <div className="mb-3 flex items-center justify-between sm:mb-4">
  <p className="text-sm font-medium text-slate-500">Viaje de ida</p>
  {(origen || destino) && (
    <button
      type="button"
      onClick={() => { setOrigen(''); setDestino(''); }}
      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-400 transition"
    >
      <X size={12} />
      Limpiar ruta
    </button>
  )}
</div>

        {/* Origen / Swap / Destino */}
        <div className="relative mb-1 flex items-center justify-center gap-2 sm:gap-4">

          {/* Origen */}
          <button
            type="button"
            onClick={() => setModalTipo('origen')}
            className="flex-1 text-center min-w-0 mx-10"
          >
            <p className="text-3xl font-black leading-none tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {origenData ? origenData.sigla : <span className="text-slate-300">---</span>}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400 truncate">
              {origenData ? origenData.nombre : 'Origen'}
            </p>
          </button>

          {/* Swap circular */}
          <button
            type="button"
            onClick={invertirRuta}
            disabled={!origen || !destino}
            className="mx-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full! border! border-slate-300 bg-white text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:opacity-30 sm:mx-2 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-32 lg:w-32"
          >
            <ArrowLeftRight size={18} className="sm:hidden" />
            <ArrowLeftRight size={24} className="hidden sm:block md:hidden" />
            <ArrowLeftRight size={28} className="hidden md:block lg:hidden" />
            <ArrowLeftRight size={40} className="hidden lg:block" />
          </button>

          {/* Destino */}
          <button
            type="button"
            onClick={() => setModalTipo('destino')}
            className="flex-1 text-center min-w-0 mx-10"
          >
            <p className="text-3xl font-black leading-none tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {destinoData ? destinoData.sigla : <span className="text-slate-300">---</span>}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400 truncate">
              {destinoData ? destinoData.nombre : 'Destino'}
            </p>
          </button>

        </div>

        {/* Divisor */}
        <div className="my-4 h-px bg-slate-200 sm:my-5" />

        {/* Fecha + Pasajeros */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center">

          {/* Fecha con ícono de bus */}
          <div className="flex flex-1 items-center gap-2">
            <BusFront size={22} className="shrink-0 text-slate-500 sm:size-8" />
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base font-semibold text-slate-700 outline-none sm:py-3 sm:text-xl"
            />
          </div>

          {/* Contador pasajeros */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 sm:py-3">
            <Armchair size={20} className="shrink-0 text-slate-500" />
            <button
              type="button"
              onClick={() => setCantidadPasajes(Math.max(1, cantidadPasajes - 1))}
              disabled={cantidadPasajes <= 1}
              className="flex h-7 w-7 items-center justify-center text-2xl font-light text-slate-600 transition hover:text-slate-900 disabled:opacity-30 sm:h-8 sm:w-8 sm:text-3xl"
            >
              −
            </button>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold text-slate-800 sm:h-9 sm:w-9 sm:text-xl">
              {cantidadPasajes}
            </span>

            <button
              type="button"
              onClick={() => setCantidadPasajes(Math.min(5, cantidadPasajes + 1))}
              disabled={cantidadPasajes >= 5}
              className="flex h-7 w-7 items-center justify-center text-2xl font-light text-slate-600 transition hover:text-slate-900 disabled:opacity-30 sm:h-8 sm:w-8 sm:text-3xl"
            >
              +
            </button>
          </div>

        </div>

        {/* Botón circular Buscar */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={buscando}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-full! bg-teal-700 text-white shadow-lg ring-4 ring-teal-100 transition hover:scale-105 hover:bg-teal-600 disabled:opacity-70 sm:h-28 sm:w-28"
          >
            {buscando ? (
              <Loader2 size={26} className="animate-spin sm:size-8" />
            ) : (
              <>
                <BusFront size={26} className="sm:size-8" />
                <span className="mt-1 text-xs font-bold sm:text-sm">Buscar</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Modal bottom sheet */}
      {modalTipo && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setModalTipo(null)}
        >
          <div
            className="w-full rounded-t-3xl bg-white px-4 pb-8 pt-4 shadow-2xl sm:px-5 sm:pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-slate-200" />

            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-bold text-slate-800">
                {modalTipo === 'origen' ? 'Seleccionar origen' : 'Seleccionar destino'}
              </p>
              <button
                type="button"
                onClick={() => setModalTipo(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {departamentos
              .filter(dep =>
    modalTipo === 'origen'
      ? dep.nombre !== destino
      : dep.nombre !== origen
  )
              .map(dep => (
                <button
                  key={dep.nombre}
                  type="button"
                  onClick={() => seleccionarDepartamento(dep)}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-teal-600" />
                    <span className="text-sm font-semibold text-slate-700">{dep.nombre}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{dep.sigla}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setModalTipo(null)}
              className="mt-4 w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}