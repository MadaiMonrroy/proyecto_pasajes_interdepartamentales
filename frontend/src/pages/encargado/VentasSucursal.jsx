import { useEffect, useState } from 'react';
import {
  Ticket, Search, RefreshCw, ChevronDown, AlertTriangle,
  CheckCircle2, X, Loader2, Ban, TrendingUp, QrCode, Banknote, MapPin
} from 'lucide-react';
import { ventasSucursal, cancelarBoletoEncargado } from '../../api/boletosApi';

function hoy()       { return new Date().toISOString().slice(0, 10); }
function inicioMes() { return new Date(new Date().setDate(1)).toISOString().slice(0, 10); }

function formatFecha(f) {
  return new Date(f).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

function badgeBoleto(estado) {
  if (estado === 'Comprado')  return 'bg-green-50 text-green-700 border border-green-200';
  if (estado === 'Abordado')  return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (estado === 'Cancelado') return 'bg-red-50 text-red-500 border border-red-200';
  return 'bg-slate-100 text-slate-500 border border-slate-200';
}

// Calcular penalización en el frontend para mostrar preview
function calcularPenalizacion(fechaSalida, montoOriginal) {
  const ahora          = new Date();
  const salida         = new Date(fechaSalida);
  const horasRestantes = (salida - ahora) / (1000 * 60 * 60);
  const porcentaje     = horasRestantes < 24 ? 20 : 15;
  const penalizacion   = Number((montoOriginal * (porcentaje / 100)).toFixed(2));
  const devolucion     = Number((montoOriginal - penalizacion).toFixed(2));
  return { porcentaje, penalizacion, devolucion, horasRestantes: Math.round(horasRestantes) };
}

// ── Modal cancelación con desglose de penalización ───────
function ModalCancelar({ boleto, onCerrar, onCancelado }) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError]           = useState('');

  const preview = calcularPenalizacion(boleto.fecha_hora_salida, boleto.monto_pagado);

  async function confirmar() {
    setProcesando(true);
    try {
      await cancelarBoletoEncargado(boleto.id);
      onCancelado();
      onCerrar();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="font-black text-slate-800">Cancelar boleto</p>
          <button onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* Info del boleto */}
          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">{boleto.codigo_boleto}</p>
            <p className="text-xs text-slate-500">{boleto.nombre_pasajero} · Asiento {boleto.numero_asiento}</p>
            <p className="text-xs text-slate-500">{boleto.origen} → {boleto.destino}</p>
            <p className="mt-1 text-xs text-slate-400">
              Faltan aprox. <strong>{preview.horasRestantes}h</strong> para la salida
            </p>
          </div>

          {/* Desglose penalización */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Monto pagado</span>
              <span className="font-bold text-slate-800">Bs. {boleto.monto_pagado}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Penalización ({preview.porcentaje}%)
                {preview.horasRestantes < 24 ? ' · menos de 24h' : ' · más de 24h'}
              </span>
              <span className="font-bold text-red-500">− Bs. {preview.penalizacion}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-700">A devolver</span>
              <span className="text-base font-black text-teal-700">Bs. {preview.devolucion}</span>
            </div>
          </div>

          <div className="mb-5 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            Esta acción no se puede deshacer.
          </div>

          {error && (
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-red-500">
              <AlertTriangle size={13} />{error}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={onCerrar}
              className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              No cancelar
            </button>
            <button onClick={confirmar} disabled={procesando}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-70">
              {procesando ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              {procesando ? 'Cancelando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vista principal ──────────────────────────────────────
export default function VentasSucursal() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);
  const [modal,    setModal]    = useState(null);

  const [desde,        setDesde]        = useState(inicioMes());
  const [hasta,        setHasta]        = useState(hoy());
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda,     setBusqueda]     = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const result = await ventasSucursal(desde, hasta, filtroEstado === 'todos' ? '' : filtroEstado);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function mostrarToast(msg, tipo = 'ok') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  function onCancelado() {
    cargar();
    mostrarToast('Boleto cancelado correctamente.');
  }

  const ventas = data?.ventas || [];

  const filtradas = ventas.filter(v => {
    const txt = busqueda.toLowerCase();
    return !txt || (
      v.codigo_boleto?.toLowerCase().includes(txt) ||
      v.nombre_pasajero?.toLowerCase().includes(txt) ||
      v.ci_pasajero?.toLowerCase().includes(txt) ||
      v.destino?.toLowerCase().includes(txt)
    );
  });

  const puedesCancelar = (boleto) =>
    boleto.estado === 'Comprado' &&
    new Date() < new Date(boleto.fecha_hora_salida);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto ">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg text-white
            ${toast.tipo === 'error' ? 'bg-red-600' : 'bg-teal-700'}`}>
            {toast.tipo === 'error' ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        )}

        {/* Cabecera */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Ventas de la sucursal</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Historial y gestión de boletos vendidos
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

        {/* KPIs */}
        {data?.kpis && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icono: <TrendingUp size={17} />, label: 'Ingresos',       valor: `Bs. ${Number(data.kpis.ingresos || 0).toFixed(0)}`,      color: 'bg-teal-50 text-teal-700' },
              { icono: <Ticket size={17} />,     label: 'Boletos activos', valor: data.kpis.activos || 0,                                   color: 'bg-blue-50 text-blue-700' },
              { icono: <Ban size={17} />,         label: 'Cancelados',      valor: data.kpis.cancelados || 0,                                color: 'bg-amber-50 text-amber-700' },
              { icono: <TrendingUp size={17} />, label: 'Devoluciones',    valor: `Bs. ${Number(data.kpis.devoluciones || 0).toFixed(0)}`,  color: 'bg-red-50 text-red-600' },
            ].map(k => (
              <div key={k.label} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${k.color}`}>
                  {k.icono}
                </div>
                <p className="text-xl font-black text-slate-900">{k.valor}</p>
                <p className="text-xs font-semibold text-slate-500">{k.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Rutas y métodos */}
        {data && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <MapPin size={14} className="text-teal-600" /> Rutas del período
              </p>
              {!data.rutas?.length ? (
                <p className="text-xs text-slate-400">Sin datos.</p>
              ) : (
                <div className="space-y-2">
                  {data.rutas.map((r, i) => (
                    <div key={r.ruta} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        <span className="mr-1 font-black text-teal-600">#{i + 1}</span>{r.ruta}
                      </span>
                      <span className="font-bold text-slate-800">{r.boletos} boletos</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-black text-slate-800">Métodos de pago</p>
              {!data.metodos?.length ? (
                <p className="text-xs text-slate-400">Sin datos.</p>
              ) : (
                <div className="space-y-2">
                  {data.metodos.map(m => (
                    <div key={m.metodo_pago} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                        {m.metodo_pago === 'QR' ? <QrCode size={14} /> : <Banknote size={14} />}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-700">{m.metodo_pago}</span>
                      <span className="text-xs text-slate-400">{m.cantidad} transac.</span>
                      <span className="text-sm font-black text-teal-700">Bs. {Number(m.total).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative min-w-[180px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por código, nombre, CI..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-400" />
          </div>

          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-teal-400" />

          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-teal-400" />

          <div className="relative">
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-teal-400">
              <option value="todos">Todos</option>
              <option value="Comprado">Comprado</option>
              <option value="Abordado">Abordado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button onClick={cargar}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600">
            Filtrar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
              <p className="text-sm font-semibold text-slate-400">Cargando ventas...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="py-16 text-center">
              <Ticket size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">No se encontraron boletos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Boleto', 'Ruta', 'Pasajero', 'Salida', 'Pago', 'Monto', 'Estado', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtradas.map(v => (
                    <tr key={v.id} className={`transition hover:bg-slate-50/60 ${v.estado === 'Cancelado' ? 'opacity-60' : ''}`}>

                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-700">{v.codigo_boleto}</p>
                        <p className="text-[11px] text-slate-400">Asiento {v.numero_asiento}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-700">{v.origen} → {v.destino}</p>
                        <p className="text-[11px] text-slate-400">{v.codigo_ruta || ''}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-700">{v.nombre_pasajero}</p>
                        <p className="text-[11px] text-slate-400">CI: {v.ci_pasajero}{v.es_menor ? ' · Menor' : ''}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-600">{formatFecha(v.fecha_hora_salida)}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                          {v.metodo_pago === 'QR' ? <QrCode size={13} /> : <Banknote size={13} />}
                          {v.metodo_pago}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-sm font-black text-teal-700">Bs. {v.monto_pagado}</p>
                        {v.estado === 'Cancelado' && Number(v.monto_devuelto) > 0 && (
                          <p className="text-[11px] text-red-400">Dev: Bs. {v.monto_devuelto}</p>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badgeBoleto(v.estado)}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {v.estado}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {puedesCancelar(v) && (
                          <button
                            onClick={() => setModal(v)}
                            title="Cancelar boleto"
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Ban size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs font-medium text-slate-400">
                {filtradas.length} de {ventas.length} boletos
              </p>
            </div>
          )}
        </div>

      </div>

      {modal && (
        <ModalCancelar
          boleto={modal}
          onCerrar={() => setModal(null)}
          onCancelado={onCancelado}
        />
      )}
    </div>
  );
}