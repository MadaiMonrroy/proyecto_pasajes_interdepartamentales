import { useState } from 'react';
import { MapPin, CalendarDays, Loader2, ArrowLeftRight, X, BusFront,Armchair } from 'lucide-react';

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

  return (
    <>
      <form onSubmit={onBuscar} className="bg-white px-6 py-6">

        {/* Etiqueta */}
        <p className="mb-4 text-sm font-medium text-slate-500">Viaje de ida</p>

        {/* Origen / Swap / Destino — igual que la referencia */}
        <div className="relative mb-1 flex items-center justify-between px-56">

          {/* Origen */}
          <button
            type="button"
            onClick={() => setModalTipo('origen')}
            className="flex-1 text-center  "
          >
            <p className="text-5xl font-black leading-none tracking-tight text-slate-900">
              {origenData ? origenData.sigla : <span className="text-slate-300">---</span>}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
              {origenData ? origenData.nombre : 'Origen'}
            </p>
          </button>

          {/* Swap circular — igual al de la imagen */}
          <button
            type="button"
            onClick={invertirRuta}
            disabled={!origen || !destino}
            className="mx-4 flex h-24 w-24 shrink-0 items-center  justify-center rounded-full! border border-slate-300 bg-white text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:opacity-30"
          >
            <ArrowLeftRight size={32} />
          </button>

          {/* Destino */}
          <button
            type="button"
            onClick={() => setModalTipo('destino')}
            className="flex-1 text-center"
          >
            <p className="text-5xl font-black leading-none tracking-tight text-slate-900">
              {destinoData ? destinoData.sigla : <span className="text-slate-300">---</span>}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
              {destinoData ? destinoData.nombre : 'Destino'}
            </p>
          </button>

        </div>

        {/* Divisor */}
        <div className="my-5 h-px bg-slate-200" />

        {/* Fecha + Pasajeros — misma fila que la referencia */}
        <div className="mb-10 flex items-center gap-3">

          {/* Fecha con ícono de bus — igual a la referencia */}
          <label className="flex flex-1 cursor-pointer items-center gap-2.5">
            <BusFront size={32} className="shrink-0 text-slate-500" />
            
          </label>
<input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
              className="w-full  gap-1  text-xl! font-semibold rounded-xl! border border-slate-300 text-slate-700 outline-none px-3 py-3"
            />
          {/* Contador pasajeros con borde — igual a la referencia */}
          <div className="flex  items-center gap-1 w-52 rounded-xl! border border-slate-300 px-3 py-3">
            {/* Ícono asiento */}
            <Armchair size={23} />
            <button
              type="button"
              onClick={() => setCantidadPasajes(Math.max(1, cantidadPasajes - 1))}
              disabled={cantidadPasajes <= 1}
              className="flex h-8 w-8 items-center justify-center text-3xl! font-light text-slate-600 transition hover:text-slate-900 disabled:opacity-30"
            >
              −
            </button>

            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-xl font-bold text-slate-800">
              {cantidadPasajes}
            </span>

            <button
              type="button"
              onClick={() => setCantidadPasajes(Math.min(5, cantidadPasajes + 1))}
              disabled={cantidadPasajes >= 5}
              className="flex h-8 w-8 items-center justify-center text-3xl! font-light text-slate-600 transition hover:text-slate-900 disabled:opacity-30"
            >
              +
            </button>
          </div>

        </div>

        {/* Botón circular — igual a la referencia */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={buscando}
            className="flex h-28 w-28 flex-col items-center justify-center !rounded-full bg-teal-700 text-white shadow-lg ring-4 ring-teal-100 transition hover:scale-105 hover:bg-teal-600 disabled:opacity-70"
          >
            {buscando ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <>
                <BusFront size={32} />
                <span className="mt-1 text-sm font-bold">Buscar</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Modal */}
      {modalTipo && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setModalTipo(null)}
        >
          <div
            className="w-full rounded-t-3xl bg-white px-5 pb-10 pt-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-slate-200" />

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
              {departamentos.map(dep => (
                <button
                  key={dep.nombre}
                  type="button"
                  onClick={() => seleccionarDepartamento(dep)}
                  className="flex items-center justify-between rounded-2xl! border border-slate-100 px-4 py-3.5 transition hover:border-teal-200 hover:bg-teal-50"
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
              className="mt-4 w-full rounded-2xl! border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}