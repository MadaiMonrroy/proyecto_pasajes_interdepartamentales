import { useEffect, useState } from 'react';
import {
  DollarSign, RouteOff, Eye, X, Loader2, Search,
  RefreshCw, ChevronDown, AlertTriangle, CheckCircle2,
  Clock, Ban, CircleCheck, Navigation, Bus,
  TrendingUp, TrendingDown, History
} from 'lucide-react';

import { listarViajes, cambiarEstadoViaje } from '../../api/viajesApi';
import { actualizarPrecio, historialPrecios } from '../../api/preciosApi';

// ─────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────
const ESTADOS_VIAJE = [
  { valor: 'Disponible',           label: 'Disponible',  color: 'bg-green-50 text-green-700 border-green-200',  icono: <CheckCircle2 size={13} /> },
  { valor: 'En curso',             label: 'En curso',    color: 'bg-blue-50 text-blue-700 border-blue-200',     icono: <Navigation size={13} /> },
  { valor: 'Demorado',             label: 'Demorado',    color: 'bg-amber-50 text-amber-700 border-amber-200',  icono: <Clock size={13} /> },
  { valor: 'Cancelado_Emergencia', label: 'Cancelado',   color: 'bg-red-50 text-red-600 border-red-200',        icono: <Ban size={13} /> },
  { valor: 'Finalizado',           label: 'Finalizado',  color: 'bg-slate-100 text-slate-500 border-slate-200', icono: <CircleCheck size={13} /> },
];

function getEstado(valor) {
  return ESTADOS_VIAJE.find(e => e.valor === valor) || ESTADOS_VIAJE[0];
}

function formatFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatHora(f) {
  if (!f) return '—';
  return new Date(f).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

function formatFechaCorta(f) {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
}

// ─────────────────────────────────────────────────────────
// Componentes base
// ─────────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children, ancho = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        className={`w-full ${ancho} max-h-[90vh] overflow-y-auto rounded-3xl! bg-white shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-base font-black text-slate-800">{titulo}</p>
          <button onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Modal cambiar precio
// ─────────────────────────────────────────────────────────
function ModalPrecio({ viaje, onCerrar, onGuardado }) {
  const [precio, setPrecio]       = useState(String(viaje.precio));
  const [error, setError]         = useState('');
  const [guardando, setGuardando] = useState(false);

  const precioAnterior = Number(viaje.precio);
  const precioNuevo    = Number(precio);
  const diferencia     = precioNuevo - precioAnterior;
  const hayDiferencia  = precio !== '' && precioNuevo !== precioAnterior;

  async function guardar(e) {
    e.preventDefault();
    setError('');

    if (!precio || isNaN(precioNuevo) || precioNuevo <= 0) {
      setError('Ingresa un precio válido mayor a 0.');
      return;
    }
    if (precioNuevo === precioAnterior) {
      setError('El precio nuevo es igual al actual.');
      return;
    }

    setGuardando(true);
    try {
      await actualizarPrecio(viaje.id, precioNuevo);
      onGuardado('Precio actualizado correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Actualizar precio" onCerrar={onCerrar}>

      {/* Info del viaje */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl! border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl! bg-teal-100 text-teal-700">
          <Bus size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {viaje.origen} → {viaje.destino}
          </p>
          <p className="text-xs text-slate-400">
            {viaje.codigo_ruta || `VIAJE-${viaje.id}`} · {viaje.placa}
          </p>
        </div>
      </div>

      <form onSubmit={guardar}>

        {/* Precio actual */}
        <div className="mb-4 flex items-center justify-between rounded-2xl! bg-slate-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-500">Precio actual</span>
          <span className="text-xl font-black text-slate-700">Bs. {viaje.precio}</span>
        </div>

        {/* Nuevo precio */}
        <div className="mb-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Nuevo precio (Bs.) *
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={precio}
            onChange={e => { setPrecio(e.target.value); setError(''); }}
            placeholder="Ej: 150"
            className={`w-full rounded-xl! border px-4 py-3 text-lg font-bold text-slate-800 outline-none transition
              focus:border-teal-500 focus:ring-2 focus:ring-teal-100
              ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
          />
        </div>

        {/* Preview de diferencia */}
        {hayDiferencia && !error && (
          <div className={`mb-3 flex items-center justify-between rounded-xl! px-4 py-2.5 text-sm font-semibold
            ${diferencia > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <span className="flex items-center gap-1.5">
              {diferencia > 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {diferencia > 0 ? 'Aumento de' : 'Reducción de'}
            </span>
            <span className="font-black">
              Bs. {Math.abs(diferencia).toFixed(2)}
            </span>
          </div>
        )}

        {error && (
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-red-500">
            <AlertTriangle size={14} />{error}
          </p>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCerrar}
            className="flex-1 rounded-xl! border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={guardando}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl! bg-teal-700 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
            {guardando ? 'Guardando...' : 'Actualizar precio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal cambiar estado
// ─────────────────────────────────────────────────────────
function ModalEstado({ viaje, onCerrar, onGuardado }) {
  const [estado, setEstado]       = useState(viaje.estado);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  async function guardar() {
    if (estado === viaje.estado) { onCerrar(); return; }
    setGuardando(true);
    try {
      await cambiarEstadoViaje(viaje.id, estado);
      onGuardado(`Estado cambiado a "${getEstado(estado).label}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Cambiar estado del viaje" onCerrar={onCerrar}>

      {/* Info del viaje */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl! border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl! bg-teal-100 text-teal-700">
          <Bus size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {viaje.origen} → {viaje.destino}
          </p>
          <p className="text-xs text-slate-400">
            Salida: {formatHora(viaje.fecha_hora_salida)} · {formatFechaCorta(viaje.fecha_hora_salida)}
          </p>
        </div>
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Selecciona el nuevo estado
      </p>

      <div className="mb-4 grid gap-2">
        {ESTADOS_VIAJE.map(e => (
          <button
            key={e.valor}
            type="button"
            onClick={() => setEstado(e.valor)}
            className={`flex items-center gap-3 rounded-2xl! border-2 px-4 py-3 text-sm font-bold transition
              ${estado === e.valor
                ? `${e.color} border-current`
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
          >
            {e.icono}
            {e.label}
            {e.valor === viaje.estado && (
              <span className="ml-1 text-[10px] font-normal opacity-50">(actual)</span>
            )}
            {estado === e.valor && estado !== viaje.estado && (
              <span className="ml-auto text-[10px] opacity-60">Seleccionado</span>
            )}
          </button>
        ))}
      </div>

      {/* Aviso cancelación */}
      {estado === 'Cancelado_Emergencia' && (
        <div className="mb-4 flex items-start gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Este viaje quedará cancelado. Los pasajeros con boletos activos deberán ser notificados manualmente.
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-xl! bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">{error}</p>
      )}

      <div className="flex gap-3 border-t border-slate-100 pt-4">
        <button onClick={onCerrar}
          className="flex-1 rounded-xl! border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
        <button onClick={guardar} disabled={guardando || estado === viaje.estado}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl! bg-teal-700 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-50">
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <RouteOff size={15} />}
          {guardando ? 'Aplicando...' : 'Aplicar estado'}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal historial de precios de un viaje
// ─────────────────────────────────────────────────────────
function ModalHistorialViaje({ viaje, historial, onCerrar }) {
  const items = historial.filter(h => h.id_viaje === viaje.id);

  return (
    <Modal titulo={`Historial · ${viaje.origen} → ${viaje.destino}`} onCerrar={onCerrar} ancho="max-w-lg">
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm font-semibold text-slate-400">
          Sin cambios de precio registrados.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => {
            const subio = Number(item.precio_nuevo) > Number(item.precio_anterior);
            return (
              <div key={item.id} className="flex items-center justify-between rounded-2xl! border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{item.nombre}</p>
                  <p className="text-[11px] text-slate-400">{formatFecha(item.fecha_cambio)}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-sm font-semibold text-slate-400 line-through">Bs. {item.precio_anterior}</span>
                  <span className={`flex items-center gap-1 text-sm font-black ${subio ? 'text-green-700' : 'text-red-600'}`}>
                    {subio ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    Bs. {item.precio_nuevo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button onClick={onCerrar}
          className="rounded-xl! bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────
export default function Precios() {
  const [viajes, setViajes]     = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [tabActiva, setTabActiva] = useState('viajes'); // 'viajes' | 'historial'

  async function cargar() {
    setCargando(true);
    try {
      const [viajesData, historialData] = await Promise.all([
        listarViajes(),
        historialPrecios()
      ]);
      setViajes(viajesData);
      setHistorial(historialData);
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function mostrarToast(mensaje, tipo = 'ok') {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 4000);
  }

  function onGuardado(msg) {
    setModal(null);
    cargar();
    mostrarToast(msg);
  }

  const viajesFiltrados = viajes.filter(v => {
    const txt = busqueda.toLowerCase();
    const coincide = !txt || (
      v.origen?.toLowerCase().includes(txt) ||
      v.destino?.toLowerCase().includes(txt) ||
      v.placa?.toLowerCase().includes(txt) ||
      v.codigo_ruta?.toLowerCase().includes(txt)
    );
    const est = !filtroEstado || v.estado === filtroEstado;
    return coincide && est;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl! px-5 py-3.5 shadow-lg text-white
            ${toast.tipo === 'error' ? 'bg-red-600' : 'bg-teal-700'}`}>
            {toast.tipo === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-sm font-semibold">{toast.mensaje}</span>
          </div>
        )}

        {/* Cabecera */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Precios y estados</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Gestión de tarifas y estado operativo de los viajes
            </p>
          </div>
          <button onClick={cargar}
            className="flex h-10 w-10 items-center justify-center rounded-xl! border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-2xl! border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTabActiva('viajes')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl! py-2.5 text-sm font-bold transition
              ${tabActiva === 'viajes' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <DollarSign size={15} />
            Viajes
          </button>
          <button
            onClick={() => setTabActiva('historial')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl! py-2.5 text-sm font-bold transition
              ${tabActiva === 'historial' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <History size={15} />
            Historial de precios
          </button>
        </div>

        {/* ── TAB VIAJES ── */}
        {tabActiva === 'viajes' && (
          <>
            {/* Filtros */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por ruta, placa o código..."
                  className="w-full rounded-xl! border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
                />
              </div>
              <div className="relative">
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                  className="appearance-none rounded-xl! border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-teal-400">
                  <option value="">Todos los estados</option>
                  {ESTADOS_VIAJE.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm">
              {cargando ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
                  <p className="text-sm font-semibold">Cargando viajes...</p>
                </div>
              ) : viajesFiltrados.length === 0 ? (
                <div className="py-16 text-center">
                  <DollarSign size={36} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No se encontraron viajes.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {['Viaje', 'Bus', 'Salida', 'Estado', 'Precio actual', 'Acciones'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viajesFiltrados.map(viaje => {
                        const est = getEstado(viaje.estado);
                        const itemsHistorial = historial.filter(h => h.id_viaje === viaje.id).length;
                        return (
                          <tr key={viaje.id} className="transition hover:bg-slate-50/60">

                            {/* Viaje */}
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-bold text-slate-900">
                                {viaje.origen} → {viaje.destino}
                              </p>
                              <p className="text-xs text-slate-400">
                                {viaje.codigo_ruta || `VIAJE-${viaje.id}`}
                              </p>
                            </td>

                            {/* Bus */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                                  <Bus size={13} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">{viaje.placa}</p>
                                  <p className="text-xs text-slate-400">{viaje.tipo_bus}</p>
                                </div>
                              </div>
                            </td>

                            {/* Salida */}
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-semibold text-slate-700">{formatHora(viaje.fecha_hora_salida)}</p>
                              <p className="text-xs text-slate-400">{formatFechaCorta(viaje.fecha_hora_salida)}</p>
                            </td>

                            {/* Estado */}
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${est.color}`}>
                                {est.icono}{est.label}
                              </span>
                            </td>

                            {/* Precio */}
                            <td className="px-5 py-3.5">
                              <p className="text-base font-black text-teal-700">Bs. {viaje.precio}</p>
                              {itemsHistorial > 0 && (
                                <p className="text-[10px] text-slate-400">{itemsHistorial} cambio(s)</p>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1">
                                {/* Cambiar precio */}
                                <button
                                  onClick={() => setModal({ tipo: 'precio', viaje })}
                                  title="Cambiar precio"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-teal-50 hover:text-teal-700">
                                  <DollarSign size={15} />
                                </button>

                                {/* Cambiar estado */}
                                <button
                                  onClick={() => setModal({ tipo: 'estado', viaje })}
                                  title="Cambiar estado"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                                  <RouteOff size={15} />
                                </button>

                                {/* Ver historial de este viaje */}
                                <button
                                  onClick={() => setModal({ tipo: 'historial-viaje', viaje })}
                                  title="Historial de precios"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                  <Eye size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!cargando && (
                <div className="border-t border-slate-100 px-5 py-3">
                  <p className="text-xs font-medium text-slate-400">
                    {viajesFiltrados.length} de {viajes.length} viajes
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB HISTORIAL GLOBAL ── */}
        {tabActiva === 'historial' && (
          <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
                <p className="text-sm font-semibold">Cargando historial...</p>
              </div>
            ) : historial.length === 0 ? (
              <div className="py-16 text-center">
                <History size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">Sin cambios de precio registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Ruta', 'Precio anterior', 'Precio nuevo', 'Variación', 'Modificado por', 'Fecha'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historial.map(item => {
                      const subio = Number(item.precio_nuevo) > Number(item.precio_anterior);
                      const diff  = Math.abs(Number(item.precio_nuevo) - Number(item.precio_anterior)).toFixed(2);
                      return (
                        <tr key={item.id} className="transition hover:bg-slate-50/60">

                          <td className="px-5 py-3.5">
                            <p className="text-sm font-bold text-slate-800">
                              {item.origen} → {item.destino}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.codigo_ruta || `VIAJE-${item.id_viaje}`}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-500 line-through">
                              Bs. {item.precio_anterior}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-black ${subio ? 'text-green-700' : 'text-red-600'}`}>
                              Bs. {item.precio_nuevo}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold
                              ${subio ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                              {subio ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {subio ? '+' : '-'}Bs. {diff}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-700">{item.nombre}</span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-500">{formatFecha(item.fecha_cambio)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!cargando && (
              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs font-medium text-slate-400">{historial.length} cambio(s) registrado(s)</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modales */}
      {modal?.tipo === 'precio'          && <ModalPrecio         viaje={modal.viaje} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'estado'          && <ModalEstado         viaje={modal.viaje} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'historial-viaje' && <ModalHistorialViaje viaje={modal.viaje} historial={historial} onCerrar={() => setModal(null)} />}
    </div>
  );
}