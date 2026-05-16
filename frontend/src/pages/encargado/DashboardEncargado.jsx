import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bus, CheckCircle2, Clock, Navigation, Ban,
  AlertTriangle, Loader2, RefreshCw, ChevronRight,
  X, Power, TrendingUp, Ticket, MapPin, QrCode, Banknote
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
function getToken() { return localStorage.getItem('token'); }

async function fetchResumenEncargado() {
  const res  = await fetch(`${API_URL}/api/boletos/resumen-encargado`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchViajesHoy() {
  const res  = await fetch(`${API_URL}/api/salidas`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchPasajeros(idViaje) {
  const res  = await fetch(`${API_URL}/api/salidas/${idViaje}/pasajeros`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function patchAbordado(idViaje, idBoleto) {
  const res = await fetch(`${API_URL}/api/salidas/${idViaje}/abordar/${idBoleto}`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function patchSalida(idViaje, estado, incidencia) {
  const res = await fetch(`${API_URL}/api/salidas/${idViaje}/registrar-salida`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ estado, incidencia })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

function badgeEstado(estado) {
  const m = {
    Disponible:           { clase: 'bg-green-50 text-green-700 border-green-200',  icono: <CheckCircle2 size={12} /> },
    'En curso':           { clase: 'bg-blue-50 text-blue-700 border-blue-200',    icono: <Navigation size={12} /> },
    Demorado:             { clase: 'bg-amber-50 text-amber-700 border-amber-200', icono: <Clock size={12} /> },
    Cancelado_Emergencia: { clase: 'bg-red-50 text-red-600 border-red-200',        icono: <Ban size={12} /> },
    Finalizado:           { clase: 'bg-slate-100 text-slate-500 border-slate-200', icono: <CheckCircle2 size={12} /> },
  };
  return m[estado] || m['Disponible'];
}

// ── Modal control de pasajeros ───────────────────────────
function ModalPasajeros({ viaje, onCerrar, onActualizar }) {
  const [pasajeros,    setPasajeros]    = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [modalSalida,  setModalSalida]  = useState(false);
  const [estadoSalida, setEstadoSalida] = useState('En curso');
  const [incidencia,   setIncidencia]   = useState('');
  const [procesando,   setProcesando]   = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    fetchPasajeros(viaje.id)
      .then(setPasajeros)
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  }, [viaje.id]);

  async function abordar(boleto) {
    if (boleto.estado === 'Abordado') return;
    try {
      await patchAbordado(viaje.id, boleto.id);
      setPasajeros(prev => prev.map(p =>
        p.id === boleto.id ? { ...p, estado: 'Abordado' } : p
      ));
    } catch (e) { setError(e.message); }
  }

  async function registrarSalida() {
    setProcesando(true);
    try {
      await patchSalida(viaje.id, estadoSalida, incidencia);
      onActualizar();
      onCerrar();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  const abordados = pasajeros.filter(p => p.estado === 'Abordado').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="font-black text-slate-800">{viaje.origen} → {viaje.destino}</p>
            <p className="text-xs text-slate-400">
              {new Date(viaje.fecha_hora_salida).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
              {' · '}{viaje.placa}
            </p>
          </div>
          <button onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-3">
            <span className="text-sm font-semibold text-teal-700">
              Abordados: <strong>{abordados}</strong> / {pasajeros.length}
            </span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-teal-200">
              <div className="h-full rounded-full bg-teal-600 transition-all"
                style={{ width: `${pasajeros.length ? (abordados / pasajeros.length) * 100 : 0}%` }} />
            </div>
          </div>

          {error && <p className="mb-3 text-sm font-semibold text-red-500">{error}</p>}

          {cargando ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-teal-600" /></div>
          ) : pasajeros.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Sin pasajeros registrados.</p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {pasajeros.map(p => (
                <div key={p.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition
                  ${p.estado === 'Abordado' ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                    {p.numero_asiento}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{p.nombre_pasajero}</p>
                    <p className="text-xs text-slate-400">CI: {p.ci_pasajero}{p.es_menor ? ' · Menor' : ''}</p>
                  </div>
                  <button onClick={() => abordar(p)} disabled={p.estado === 'Abordado'}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition
                      ${p.estado === 'Abordado'
                        ? 'bg-green-100 text-green-600'
                        : 'border border-slate-200 bg-white text-slate-400 hover:border-teal-300 hover:text-teal-600'}`}>
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!modalSalida ? (
            <button onClick={() => setModalSalida(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-600">
              <Power size={16} /> Registrar salida del bus
            </button>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-bold text-slate-700">Estado de salida</p>
              <div className="mb-3 grid gap-2">
                {[
                  { v: 'En curso',             c: 'border-blue-300 bg-blue-50 text-blue-700' },
                  { v: 'Demorado',             c: 'border-amber-300 bg-amber-50 text-amber-700' },
                  { v: 'Cancelado_Emergencia', c: 'border-red-300 bg-red-50 text-red-700' },
                ].map(({ v, c }) => (
                  <button key={v} onClick={() => setEstadoSalida(v)}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition
                      ${estadoSalida === v ? c : 'border-slate-200 bg-white text-slate-600'}`}>
                    {v === 'Cancelado_Emergencia' ? 'Cancelado' : v}
                  </button>
                ))}
              </div>
              <textarea value={incidencia} onChange={e => setIncidencia(e.target.value)}
                placeholder="Descripción de incidencia (opcional)" rows={2}
                className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" />
              <div className="flex gap-2">
                <button onClick={() => setModalSalida(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Atrás
                </button>
                <button onClick={registrarSalida} disabled={procesando}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
                  {procesando ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────
export default function DashboardEncargado() {
  const { usuario } = useAuth();

  const [resumen,  setResumen]  = useState(null);
  const [viajes,   setViajes]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [resumenData, viajesData] = await Promise.all([
        fetchResumenEncargado(),
        fetchViajesHoy(),
      ]);
      setResumen(resumenData);
      setViajes(viajesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const totalPasajeros = viajes.reduce((s, v) => s + Number(v.total_pasajeros  || 0), 0);
  const totalAbordados = viajes.reduce((s, v) => s + Number(v.pasajeros_abordados || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Cabecera */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              Bienvenido, {usuario.nombre} 👋
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Sucursal {usuario.sucursal} · {new Date().toLocaleDateString('es-BO', {
                weekday: 'long', day: '2-digit', month: 'long'
              })}
            </p>
          </div>
          <button onClick={cargar}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-teal-300">
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={16} />{error}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            {/* ── KPIs — datos propios del encargado ── */}
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tus ventas este mes
            </p>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icono: <TrendingUp size={18} />,
                  label: 'Ingresos del mes',
                  valor: `Bs. ${Number(resumen?.mes?.ingresos_mes || 0).toFixed(0)}`,
                  sub:   `Hoy: Bs. ${Number(resumen?.hoy?.ingresos_hoy || 0).toFixed(0)}`,
                  color: 'bg-teal-50 text-teal-700',
                },
                {
                  icono: <Ticket size={18} />,
                  label: 'Boletos vendidos',
                  valor: resumen?.mes?.activos_mes || 0,
                  sub:   `Hoy: ${resumen?.hoy?.boletos_hoy || 0} boletos`,
                  color: 'bg-blue-50 text-blue-700',
                },
                {
                  icono: <Ban size={18} />,
                  label: 'Cancelaciones',
                  valor: resumen?.mes?.cancelados_mes || 0,
                  sub:   'Este mes',
                  color: 'bg-amber-50 text-amber-700',
                },
                {
                  icono: <Bus size={18} />,
                  label: 'Viajes hoy',
                  valor: viajes.length,
                  sub:   `${totalAbordados}/${totalPasajeros} abordados`,
                  color: 'bg-purple-50 text-purple-700',
                },
              ].map(k => (
                <div key={k.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-2xl ${k.color}`}>
                    {k.icono}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{k.valor}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">{k.label}</p>
                  {k.sub && <p className="mt-0.5 text-xs text-slate-400">{k.sub}</p>}
                </div>
              ))}
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">

              {/* ── Rutas más vendidas ── */}
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
                  <MapPin size={15} className="text-teal-600" /> Tus rutas más vendidas
                </p>
                {!resumen?.rutas?.length ? (
                  <p className="py-6 text-center text-sm text-slate-400">Sin ventas este mes.</p>
                ) : (
                  <div className="space-y-3">
                    {resumen.rutas.map((r, i) => {
                      const max = Number(resumen.rutas[0].boletos);
                      return (
                        <div key={r.ruta}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              <span className="mr-1.5 font-black text-teal-600">#{i + 1}</span>{r.ruta}
                            </span>
                            <span className="font-black text-slate-800">{r.boletos} boletos</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-teal-500"
                              style={{ width: `${(Number(r.boletos) / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Métodos de pago ── */}
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-black text-slate-800">Métodos de pago</p>
                {!resumen?.metodos?.length ? (
                  <p className="py-6 text-center text-sm text-slate-400">Sin ventas este mes.</p>
                ) : (
                  <div className="space-y-3">
                    {resumen.metodos.map(m => (
                      <div key={m.metodo_pago} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                          {m.metodo_pago === 'QR' ? <QrCode size={16} /> : <Banknote size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{m.metodo_pago}</p>
                          <p className="text-xs text-slate-400">{m.cantidad} transacciones</p>
                        </div>
                        <p className="text-sm font-black text-teal-700">
                          Bs. {Number(m.total).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Control de salidas hoy ── */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <Bus size={15} className="text-teal-600" /> Control de salidas — hoy
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>{totalPasajeros} pasajeros</span>
                  <span className="font-bold text-green-700">{totalAbordados} abordados</span>
                </div>
              </div>

              {viajes.length === 0 ? (
                <div className="py-10 text-center">
                  <Bus size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">
                    No hay viajes programados para hoy.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {viajes.map(v => {
                    const est = badgeEstado(v.estado);
                    const pct = v.total_pasajeros
                      ? Math.round((v.pasajeros_abordados / v.total_pasajeros) * 100)
                      : 0;
                    return (
                      <button key={v.id} onClick={() => setModal(v)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-left transition hover:border-teal-200 hover:bg-teal-50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                            <Bus size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-slate-900">
                                {v.origen} → {v.destino}
                              </p>
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${est.clase}`}>
                                {est.icono}
                                {v.estado === 'Cancelado_Emergencia' ? 'Cancelado' : v.estado}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-xs text-slate-400">
                                {new Date(v.fecha_hora_salida).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                {' · '}{v.placa}
                              </p>
                              <div className="flex flex-1 items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                                  <div className="h-full rounded-full bg-teal-500"
                                    style={{ width: `${pct}%` }} />
                                </div>
                                <span className="shrink-0 text-[10px] font-semibold text-slate-500">
                                  {v.pasajeros_abordados}/{v.total_pasajeros}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={15} className="shrink-0 text-slate-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modal && (
        <ModalPasajeros
          viaje={modal}
          onCerrar={() => setModal(null)}
          onActualizar={cargar}
        />
      )}
    </div>
  );
}