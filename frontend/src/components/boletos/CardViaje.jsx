function formatoHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short'
  });
}

function badgeTipo(tipo) {
  if (tipo === 'Cama')      return 'bg-orange-50 text-orange-700 border border-orange-200';
  if (tipo === 'Semi Cama') return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

export default function CardViaje({ viaje, cantidadPasajes, onSeleccionar }) {
  const libres = Number(viaje.capacidad) - Number(viaje.asientos_ocupados || 0);
  const total  = Number(viaje.precio) * cantidadPasajes;

  return (
    <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* ── Franja superior ── */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-3 border-b border-teal-100/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badgeTipo(viaje.tipo_bus)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {viaje.tipo_bus || 'Estándar'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {libres} lugares libres
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Bus · {viaje.placa}
        </span>
      </div>

      {/* ── Cuerpo: timeline de ruta ── */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex items-center gap-3">

          {/* Salida */}
          <div className="min-w-0 text-left">
            <p className="text-2xl font-black leading-none tracking-tight text-slate-900">
              {formatoHora(viaje.fecha_hora_salida)}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {viaje.origen}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatoFecha(viaje.fecha_hora_salida)}
            </p>
          </div>

          {/* Línea */}
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center gap-1">
              <div className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
              <div
                className="h-px flex-1"
                style={{
                  background: 'repeating-linear-gradient(90deg, #0d9488 0, #0d9488 5px, transparent 5px, transparent 10px)',
                  opacity: 0.45
                }}
              />
              <div className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              {viaje.codigo_ruta || `VIAJE-${viaje.id}`}
            </p>
          </div>

          {/* Llegada */}
          <div className="min-w-0 text-right">
            <p className="text-2xl font-black leading-none tracking-tight text-slate-900">
              {viaje.fecha_hora_llegada ? formatoHora(viaje.fecha_hora_llegada) : '--:--'}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {viaje.destino}
            </p>
            <p className="text-[11px] text-slate-400">
              {viaje.fecha_hora_llegada ? formatoFecha(viaje.fecha_hora_llegada) : ''}
            </p>
          </div>

        </div>
      </div>

      {/* ── Footer: precio + botón ── */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Por asiento
          </p>
          <p className="text-2xl font-black leading-tight text-teal-700">
            <span className="text-sm font-semibold">Bs. </span>{viaje.precio}
          </p>
          {cantidadPasajes > 1 && (
            <p className="text-xs font-medium text-slate-500">
              Total {cantidadPasajes} pasajes: Bs. {total}
            </p>
          )}
        </div>

        <button
          onClick={onSeleccionar}
          disabled={libres < cantidadPasajes}
          className="shrink-0 rounded-2xl! bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {libres < cantidadPasajes ? 'Sin lugares' : 'Elegir asientos'}
        </button>
      </div>

    </div>
  );
}