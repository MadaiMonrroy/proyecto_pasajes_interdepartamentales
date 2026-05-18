import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, TrendingDown, Bus, Users,
  BarChart3, MapPin, Download, Loader2,
  RefreshCw, Calendar, AlertTriangle, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
function getToken() { return localStorage.getItem('token'); }

async function fetchResumen() {
  const res  = await fetch(`${API_URL}/api/reportes/resumen`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchVentas(desde, hasta, sucursal) {
  const params = new URLSearchParams({ desde, hasta });
  if (sucursal) params.set('sucursal', sucursal);
  const res  = await fetch(`${API_URL}/api/reportes/ventas?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchRutas(desde, hasta) {
  const res  = await fetch(`${API_URL}/api/reportes/rutas?desde=${desde}&hasta=${hasta}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

const SUCURSALES = ['', 'La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Sucre', 'Tarija', 'Beni', 'Pando'];

function hoy()       { return new Date().toISOString().slice(0, 10); }
function inicioMes() { return new Date(new Date().setDate(1)).toISOString().slice(0, 10); }

function KPICard({ icono, label, valor, sub, color = 'teal' }) {
  const colores = {
    teal:   'bg-teal-50 text-teal-700',
    blue:   'bg-blue-50 text-blue-700',
    amber:  'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    /* En 320px cada card mide ~140px de ancho. Con p-3 hay espacio suficiente. */
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${colores[color]}`}>
        {icono}
      </div>
      {/* whitespace-nowrap evita que "Bs. 3070.00" se parta en dos líneas */}
      <p className="whitespace-nowrap text-lg font-black text-slate-900 leading-tight">{valor ?? '—'}</p>
      {/* nowrap también en label para que no quede "Ingresos\nhoy" */}
      <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 whitespace-nowrap text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function DashboardAdmin() {
  const { usuario } = useAuth();

  const [resumen,  setResumen]  = useState(null);
  const [ventas,   setVentas]   = useState(null);
  const [rutas,    setRutas]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  const [desde,    setDesde]    = useState(inicioMes());
  const [hasta,    setHasta]    = useState(hoy());
  const [sucursal, setSucursal] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [r, v, ru] = await Promise.all([
        fetchResumen(),
        fetchVentas(desde, hasta, sucursal),
        fetchRutas(desde, hasta),
      ]);
      setResumen(r);
      setVentas(v);
      setRutas(ru);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function exportarCSV() {
    if (!ventas?.por_dia?.length) return;
    const header = 'Fecha,Sucursal,Boletos,Ingresos,Devoluciones,Neto';
    const rows = ventas.por_dia.map(r =>
      `${r.fecha},${r.sucursal},${r.cantidad_boletos},${r.ingresos},${r.devoluciones},${r.neto}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `reporte_ventas_${desde}_${hasta}.csv`; a.click();
  }

  const maxIngreso = Math.max(...(ventas?.por_dia?.map(d => Number(d.ingresos)) || [1]));

  return (
    <div className="min-h-screen px-3 py-4 md:p-6">
      <div className="mx-auto ">

        {/* ── Cabecera ── */}
        <div className="mb-5 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-black text-slate-900 sm:text-2xl md:text-3xl leading-tight">
              Bienvenido, {usuario.nombre} 👋
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
              Panel de administración · ViaGo
            </p>
          </div>
          <button
            onClick={cargar}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-teal-300 sm:px-4 sm:text-sm"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : resumen && (
          <>
            {/* ── KPIs ──
                2 columnas en móvil con gap mínimo para que cada card no sea demasiado angosta.
                4 columnas en lg. */}
            <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
              <KPICard
                icono={<TrendingUp size={16} />}
                label="Ingresos hoy"
                valor={`Bs. ${Number(resumen.hoy?.ingresos_hoy || 0).toFixed(2)}`}
                sub={`${resumen.hoy?.boletos_hoy || 0} boletos`}
                color="teal"
              />
              <KPICard
                icono={<BarChart3 size={16} />}
                label="Ingresos mes"
                valor={`Bs. ${Number(resumen.mes?.ingresos_mes || 0).toFixed(2)}`}
                sub={`${resumen.mes?.boletos_mes || 0} boletos`}
                color="blue"
              />
              <KPICard
                icono={<TrendingDown size={16} />}
                label="Cancelaciones"
                valor={resumen.cancelaciones_mes || 0}
                sub="este mes"
                color="amber"
              />
              <KPICard
                icono={<Bus size={16} />}
                label="Viajes activos"
                valor={resumen.viajes_activos || 0}
                sub="Activos"
                color="purple"
              />
            </div>

            {/* ── Por sucursal: 1 col móvil, 3 col sm+ ── */}
            {resumen.por_sucursal?.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                {resumen.por_sucursal.map(s => (
                  <div key={s.sucursal} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <MapPin size={13} className="text-teal-600 shrink-0" />
                      <p className="text-sm font-bold text-slate-700">{s.sucursal}</p>
                    </div>
                    <p className="text-xl font-black text-slate-900">Bs. {Number(s.ingresos || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{s.boletos} boletos este mes</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Filtros ──
            Móvil: cada campo en su fila (flex-col), input ancho completo.
            md+: fila horizontal. */}
        <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-3">

            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Desde</p>
              <input
                type="date" value={desde} onChange={e => setDesde(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hasta</p>
              <input
                type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
              />
            </div>

            <div className="relative flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sucursal</p>
              <select
                value={sucursal} onChange={e => setSucursal(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
              >
                {SUCURSALES.map(s => <option key={s} value={s}>{s || 'Todas'}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute bottom-3 right-2 text-slate-400" />
            </div>

            <div className="flex gap-2">
              <button onClick={cargar}
                className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600">
                <BarChart3 size={15} /> Generar
              </button>
              <button onClick={exportarCSV}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                <Download size={15} /> CSV
              </button>
            </div>

          </div>
        </div>

        {/* ── Gráfico + Rutas: 1 col móvil, 2 col lg ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-black text-slate-800">Ventas por día</p>
            {!ventas?.por_dia?.length ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin datos en el período</p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {ventas.por_dia.map(d => (
                  <div key={`${d.fecha}-${d.sucursal}`}>
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-600">
                        {new Date(d.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                        {' · '}<span className="text-slate-400">{d.sucursal}</span>
                      </span>
                      <span className="shrink-0 font-black text-teal-700">Bs. {Number(d.ingresos).toFixed(0)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${(Number(d.ingresos) / maxIngreso) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {ventas?.totales && (
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                {[
                  ['Boletos', ventas.totales.total_boletos],
                  ['Ingresos', `Bs. ${Number(ventas.totales.total_ingresos || 0).toFixed(0)}`],
                  ['Neto', `Bs. ${Number(ventas.totales.total_neto || 0).toFixed(0)}`],
                ].map(([l, v]) => (
                  <div key={l} className="text-center">
                    <p className="text-lg font-black text-slate-900">{v}</p>
                    <p className="text-xs text-slate-400">{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-black text-slate-800">Rutas más demandadas</p>
            {!rutas?.rutas?.length ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {rutas.rutas.slice(0, 6).map((r, i) => (
                  <div key={r.ruta} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-xs font-black text-teal-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{r.ruta}</p>
                      <p className="text-xs text-slate-400">{r.total_boletos} boletos · Bs. {Number(r.ingresos_totales).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}