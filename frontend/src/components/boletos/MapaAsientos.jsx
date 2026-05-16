import { Armchair, ArrowLeft } from 'lucide-react';

function columnasPorTipo(tipoBus) {
  if (tipoBus === 'Cama') return 'grid-cols-[44px_80px_44px]';
  if (tipoBus === 'Semi Cama') return 'grid-cols-[44px_44px_80px_44px]';
  return 'grid-cols-[44px_44px_80px_44px_44px]';
}

function posicionAsiento(index, tipoBus) {
  if (tipoBus === 'Cama') {
    return index % 2 === 0 ? 'col-start-1' : 'col-start-3';
  }

  if (tipoBus === 'Semi Cama') {
    const pos = index % 3;
    if (pos === 0) return 'col-start-1';
    if (pos === 1) return 'col-start-2';
    return 'col-start-4';
  }

  const pos = index % 4;
  if (pos === 0) return 'col-start-1';
  if (pos === 1) return 'col-start-2';
  if (pos === 2) return 'col-start-4';
  return 'col-start-5';
}

export default function MapaAsientos({
  viaje,
  asientosOcupados,
  asientosSeleccionados,
  setAsientosSeleccionados,
  cantidadPasajes,
  onVolver
}) {
  function toggleAsiento(numero) {
    if (asientosOcupados.includes(numero)) return;

    if (asientosSeleccionados.includes(numero)) {
      setAsientosSeleccionados(asientosSeleccionados.filter(a => a !== numero));
      return;
    }

    if (asientosSeleccionados.length >= cantidadPasajes) {
      onAviso(`Solo puede seleccionar ${cantidadPasajes} asiento(s).`);
      return;
    }

    setAsientosSeleccionados([...asientosSeleccionados, numero]);
  }

  return (
    <div className="rounded-3xl! bg-white p-5 shadow-sm border border-slate-100">
      <button
        type="button"
        onClick={onVolver}
        className="mb-4 flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"
      >
        <ArrowLeft size={18} />
        Volver a viajes
      </button>

      <div className="mb-5">
        <h2 className="text-xl font-black text-teal-900">
          Disponibilidad de asientos
        </h2>
        <p className="text-sm font-medium text-slate-500">
          {viaje.origen} → {viaje.destino} · {viaje.tipo_bus}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold">
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-300">
          <Armchair size={15} /> Libre
        </span>
        <span className="flex items-center gap-1 rounded-full bg-teal-700 px-3 py-1 text-white">
          <Armchair size={15} /> Seleccionado
        </span>
        <span className="flex items-center gap-1 rounded-full bg-slate-300 px-3 py-1 text-slate-600">
          <Armchair size={15} /> Ocupado
        </span>
      </div>

      <div className="overflow-x-auto rounded-3xl! border border-teal-100 bg-teal-50/40 p-4">
        <div className="min-w-max">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl! bg-teal-900 px-8 py-2 text-xs font-black uppercase tracking-wide text-white">
              Frente del bus
            </div>
          </div>

          <div className={`grid ${columnasPorTipo(viaje.tipo_bus)} gap-x-3 gap-y-3`}>
            {Array.from({ length: Number(viaje.capacidad) }, (_, i) => {
              const numero = i + 1;
              const ocupado = asientosOcupados.includes(numero);
              const seleccionado = asientosSeleccionados.includes(numero);

              return (
                <button
                  type="button"
                  key={numero}
                  disabled={ocupado}
                  onClick={() => toggleAsiento(numero)}
                  title={`Asiento ${numero}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${posicionAsiento(i, viaje.tipo_bus)} ${
                    ocupado
                      ? 'cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500'
                      : seleccionado
                        ? 'border-teal-700 bg-teal-700 text-white shadow-md'
                        : 'border-slate-300 bg-white text-slate-500 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800'
                  }`}
                >
                  <Armchair size={23} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl! bg-teal-50 p-4 text-sm font-bold text-teal-900">
        Asientos seleccionados: {asientosSeleccionados.length > 0 ? asientosSeleccionados.join(', ') : 'ninguno'}
      </div>
    </div>
  );
}