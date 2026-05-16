import { useEffect, useState } from 'react';
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';

import {
  obtenerAsientosOcupados,
  comprarBoleto,
  listarViajesEncargado          // ← función nueva que agregas a boletosApi.js
} from '../../api/boletosApi';

import CardViajeEncargado          from '../../components/boletos/CardViajeEncargado';
import MapaAsientos                from '../../components/boletos/MapaAsientos';
import FormularioPasajerosEncargado from '../../components/boletos/FormularioPasajerosEncargado';

// ── Paso 1: Lista de viajes
// ── Paso 2: Selección de asientos + formulario

export default function VenderPasaje() {
  // ── Viajes ──
  const [viajes, setViajes]           = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');

  // ── Filtros ──
  const [filtroOrigen,  setFiltroOrigen]  = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');
  const [filtroFecha,   setFiltroFecha]   = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ── Selección ──
  const [viajeSeleccionado,    setViajeSeleccionado]    = useState(null);
  const [asientosOcupados,     setAsientosOcupados]     = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [cantidadPasajes,      setCantidadPasajes]      = useState(1);

  // ── Pago ──
  const [metodoPago,        setMetodoPago]        = useState('QR');
  const [correoComprobante, setCorreoComprobante] = useState('');

  const departamentos = [
    'La Paz', 'Cochabamba', 'Santa Cruz',
    
  ];

  // ── Cargar viajes disponibles ──
  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const data = await listarViajesEncargado();
        setViajes(data);
      } catch (err) {
        setError(err.message || 'Error al cargar los viajes.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // ── Filtrado en cliente ──
  const viajesFiltrados = viajes.filter(v => {
    if (filtroOrigen  && v.origen  !== filtroOrigen)  return false;
    if (filtroDestino && v.destino !== filtroDestino) return false;
    if (filtroFecha) {
      const fechaViaje = new Date(v.fecha_hora_salida).toISOString().slice(0, 10);
      if (fechaViaje !== filtroFecha) return false;
    }
    return true;
  });

  const hayFiltros = filtroOrigen || filtroDestino || filtroFecha;

  function limpiarFiltros() {
    setFiltroOrigen('');
    setFiltroDestino('');
    setFiltroFecha('');
  }

  // ── Seleccionar viaje ──
  async function seleccionarViaje(viaje) {
    setViajeSeleccionado(viaje);
    setAsientosSeleccionados([]);
    setCantidadPasajes(1);
    const ocupados = await obtenerAsientosOcupados(viaje.id);
    setAsientosOcupados(ocupados);
  }

  function volverALista() {
    setViajeSeleccionado(null);
    setAsientosSeleccionados([]);
  }

  // ── Confirmar compra — retorna data para que el formulario pueda imprimir ──
  async function confirmarCompra(pasajeros) {
    if (asientosSeleccionados.length !== cantidadPasajes) {
      throw new Error(`Debe seleccionar ${cantidadPasajes} asiento(s).`);
    }

    const payload = {
      id_viaje:           viajeSeleccionado.id,
      metodo_pago:        metodoPago,
      correo_comprobante: correoComprobante,
      pasajeros: pasajeros.map((p, i) => ({
        ...p,
        numero_asiento: asientosSeleccionados[i]
      }))
    };

    const data = await comprarBoleto(payload);

    // Refrescar lista de viajes para actualizar asientos ocupados
    const actualizados = await listarViajesEncargado();
    setViajes(actualizados);

    // Volver a la lista después de éxito
    setViajeSeleccionado(null);
    setAsientosSeleccionados([]);

    return data; // el formulario usará data.comprobante_pdf para imprimir
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Cabecera */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              Vender pasaje
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Selecciona un viaje disponible para iniciar la venta
            </p>
          </div>

          {!viajeSeleccionado && (
            <button
              onClick={() => setMostrarFiltros(v => !v)}
              className={`flex items-center gap-2 rounded-2xl! border px-4 py-2.5 text-sm font-bold transition ${
                mostrarFiltros
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filtros
              {hayFiltros && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-black text-white">
                  {[filtroOrigen, filtroDestino, filtroFecha].filter(Boolean).length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── PASO 1: lista de viajes ── */}
        {!viajeSeleccionado && (
          <>
            {/* Panel de filtros */}
            {mostrarFiltros && (
              <div className="mb-5 rounded-3xl! border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">Filtrar viajes</p>
                  {hayFiltros && (
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} /> Limpiar
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Origen
                    </label>
                    <select
                      value={filtroOrigen}
                      onChange={e => setFiltroOrigen(e.target.value)}
                      className="w-full rounded-xl! border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500"
                    >
                      <option value="">Todos</option>
                      {departamentos.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Destino
                    </label>
                    <select
                      value={filtroDestino}
                      onChange={e => setFiltroDestino(e.target.value)}
                      className="w-full rounded-xl! border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500"
                    >
                      <option value="">Todos</option>
                      {departamentos.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Fecha de salida
                    </label>
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={e => setFiltroFecha(e.target.value)}
                      className="w-full rounded-xl! border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Estado cargando */}
            {cargando && (
              <div className="flex flex-col items-center justify-center rounded-3xl! border border-teal-100 bg-teal-50/60 p-12 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-teal-700" />
                <p className="font-bold text-teal-900">Cargando viajes disponibles...</p>
              </div>
            )}

            {/* Error */}
            {!cargando && error && (
              <div className="rounded-3xl! border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-bold text-red-700">{error}</p>
              </div>
            )}

            {/* Sin resultados */}
            {!cargando && !error && viajesFiltrados.length === 0 && (
              <div className="rounded-3xl! border border-amber-200 bg-amber-50 p-8 text-center">
                <Search size={32} className="mx-auto mb-3 text-amber-400" />
                <p className="text-lg font-black text-amber-800">
                  {hayFiltros ? 'Sin viajes para esos filtros' : 'No hay viajes disponibles'}
                </p>
                {hayFiltros && (
                  <button
                    onClick={limpiarFiltros}
                    className="mt-3 text-sm font-bold text-amber-700 underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {/* Lista de viajes */}
            {!cargando && !error && viajesFiltrados.length > 0 && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {viajesFiltrados.length} viaje(s) encontrado(s)
                </p>
                <div className="grid gap-4">
                  {viajesFiltrados.map(viaje => (
                    <CardViajeEncargado
                      key={viaje.id}
                      viaje={viaje}
                      onSeleccionar={() => seleccionarViaje(viaje)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── PASO 2: asientos + formulario ── */}
        {viajeSeleccionado && (
          <>
            {/* Info del viaje seleccionado */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl! border border-teal-100 bg-teal-50 px-5 py-3">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Viaje seleccionado
                </p>
                <p className="text-sm font-black text-teal-900">
                  {viajeSeleccionado.origen} → {viajeSeleccionado.destino}
                  {' · '}
                  {new Date(viajeSeleccionado.fecha_hora_salida).toLocaleDateString('es-BO', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600">
                    Pasajeros
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCantidadPasajes(v => Math.max(1, v - 1));
                        setAsientosSeleccionados([]);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200 bg-white text-lg font-bold text-teal-700 hover:bg-teal-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-base font-black text-teal-900">
                      {cantidadPasajes}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const libres = Number(viajeSeleccionado.capacidad) - asientosOcupados.length;
                        setCantidadPasajes(v => Math.min(libres, v + 1));
                        setAsientosSeleccionados([]);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal-200 bg-white text-lg font-bold text-teal-700 hover:bg-teal-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <MapaAsientos
                viaje={viajeSeleccionado}
                asientosOcupados={asientosOcupados}
                asientosSeleccionados={asientosSeleccionados}
                setAsientosSeleccionados={setAsientosSeleccionados}
                cantidadPasajes={cantidadPasajes}
                onVolver={volverALista}
              />

              <FormularioPasajerosEncargado
                cantidadPasajes={cantidadPasajes}
                asientosSeleccionados={asientosSeleccionados}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                correoComprobante={correoComprobante}
                setCorreoComprobante={setCorreoComprobante}
                precio={viajeSeleccionado.precio}
                onConfirmar={confirmarCompra}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}