import { CheckCircle2, Navigation, Clock } from 'lucide-react';

function formatoHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatoFechaCompleta(fecha) {
  return new Date(fecha).toLocaleDateString('es-BO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function badgeTipo(tipo) {
  if (tipo === 'Cama')      return 'bg-orange-50 text-orange-700 border border-orange-200';
  if (tipo === 'Semi Cama') return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

function badgeEstado(estado) {
  if (estado === 'Disponible') return {
    clase: 'bg-green-50 text-green-700 border border-green-200',
    icono: <CheckCircle2 size={12} />,
    label: 'Disponible'
  };
  if (estado === 'En curso') return {
    clase: 'bg-blue-50 text-blue-700 border border-blue-200',
    icono: <Navigation size={12} />,
    label: 'En curso'
  };
  if (estado === 'Demorado') return {
    clase: 'bg-amber-50 text-amber-700 border border-amber-200',
    icono: <Clock size={12} />,
    label: 'Demorado'
  };
  // Fallback (no debería llegar aquí si el backend filtra bien)
  return {
    clase: 'bg-slate-100 text-slate-500 border border-slate-200',
    icono: <Clock size={12} />,
    label: estado
  };
}

export default function CardViajeEncargado({ viaje, onSeleccionar }) {
  const libres     = Number(viaje.capacidad) - Number(viaje.asientos_ocupados || 0);
  const ocupados   = Number(viaje.asientos_ocupados || 0);
  const pctOcupado = Math.round((ocupados / Number(viaje.capacidad)) * 100);
  const sinLugares = libres === 0;
  const estado     = badgeEstado(viaje.estado);

  return (
    <div className={`overflow-hidden rounded-3xl! border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
      ${sinLugares ? 'border-slate-100 opacity-60' : 'border-slate-100'}`}>

      {/* Franja superior */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">

          {/* Tipo de bus */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeTipo(viaje.tipo_bus)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {viaje.tipo_bus || 'Estándar'}
          </span>

          {/* Estado del viaje */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${estado.clase}`}>
            {estado.icono}
            {estado.label}
          </span>

          <span className="text-xs font-medium text-slate-400">
            {viaje.codigo_ruta || `VIAJE-${viaje.id}`}
          </span>
        </div>

        <span className="text-xs font-medium text-slate-400">Bus · {viaje.placa}</span>
      </div>

      {/* Cuerpo */}
      <div className="px-5 py-4">

        {/* Timeline horario */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-2xl font-black leading-none tracking-tight text-slate-900">
              {formatoHora(viaje.fecha_hora_salida)}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {viaje.origen}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatoFechaCompleta(viaje.fecha_hora_salida)}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center gap-1">
              <div className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
              <div className="h-px flex-1 border-t border-dashed border-slate-300" />
              <div className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black leading-none tracking-tight text-slate-900">
              {viaje.fecha_hora_llegada ? formatoHora(viaje.fecha_hora_llegada) : '--:--'}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {viaje.destino}
            </p>
            <p className="text-[11px] text-slate-400">
              {viaje.fecha_hora_llegada ? formatoFechaCompleta(viaje.fecha_hora_llegada) : ''}
            </p>
          </div>
        </div>

        {/* Barra de ocupación */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {ocupados} ocupados ·{' '}
              <span className={`font-bold ${sinLugares ? 'text-red-500' : 'text-teal-700'}`}>
                {libres} libres
              </span>
            </span>
            <span className="text-xs font-medium text-slate-400">
              {viaje.capacidad} total
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${pctOcupado >= 90 ? 'bg-red-400' : 'bg-teal-500'}`}
              style={{ width: `${pctOcupado}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Precio por asiento
          </p>
          <p className="text-xl font-black leading-tight text-teal-700">
            <span className="text-sm font-semibold">Bs. </span>{viaje.precio}
          </p>
        </div>

        <button
          onClick={onSeleccionar}
          disabled={sinLugares}
          className="rounded-2xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {sinLugares ? 'Sin lugares' : 'Vender pasajes'}
        </button>
      </div>
    </div>
  );
}