import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket, Bus, MapPin, Clock, CheckCircle2,
  XCircle, AlertTriangle, Loader2, RefreshCw,
  X, TrendingDown, Ban
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
function getToken() { return localStorage.getItem('token'); }

async function fetchMisBoletos() {
  const res  = await fetch(`${API_URL}/api/boletos/mis-boletos`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function fetchPreviewCancelacion(id) {
  const res  = await fetch(`${API_URL}/api/cancelaciones/${id}/preview`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function confirmarCancelacion(id) {
  const res  = await fetch(`${API_URL}/api/cancelaciones/${id}`, {
    method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

function badgeBoleto(estado) {
  if (estado === 'Comprado')  return 'bg-green-50 text-green-700 border border-green-200';
  if (estado === 'Abordado')  return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (estado === 'Cancelado') return 'bg-red-50 text-red-500 border border-red-200';
  return 'bg-slate-100 text-slate-500 border border-slate-200';
}

// ── Modal cancelación ────────────────────────────────────
function ModalCancelacion({ boleto, onCerrar, onCancelado }) {
  const [preview,   setPreview]   = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error,     setError]     = useState('');
  const [exito,     setExito]     = useState(null);

  useEffect(() => {
    fetchPreviewCancelacion(boleto.id)
      .then(setPreview)
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  }, [boleto.id]);

  async function cancelar() {
    setProcesando(true);
    try {
      const data = await confirmarCancelacion(boleto.id);
      setExito(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className="w-full max-w-md rounded-3xl!  bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="font-black text-slate-800">Cancelar boleto</p>
          <button onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          {exito ? (
            <div className="text-center">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-teal-600" />
              <p className="text-lg font-black text-slate-800 mb-1">Boleto cancelado</p>
              <p className="text-sm text-slate-500 mb-4">
                Se devolverá <strong className="text-teal-700">Bs. {exito.monto_devolucion}</strong> descontando la penalización de Bs. {exito.monto_penalizacion}.
              </p>
              <button onClick={() => { onCancelado(); onCerrar(); }}
                className="w-full rounded-2xl!  bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-600">
                Aceptar
              </button>
            </div>
          ) : cargando ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-teal-600" /></div>
          ) : error ? (
            <div>
              <div className="flex items-start gap-2 rounded-2xl!  bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />{error}
              </div>
              <button onClick={onCerrar} className="w-full rounded-2xl!  bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">
                Cerrar
              </button>
            </div>
          ) : preview && (
            <>
              {/* Info boleto */}
              <div className="mb-4 rounded-2xl!  border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-800">{preview.boleto.origen} → {preview.boleto.destino}</p>
                <p className="text-xs text-slate-400">
                  {preview.boleto.codigo_boleto} · Asiento {preview.boleto.numero_asiento}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Salida: {new Date(preview.boleto.fecha_hora_salida).toLocaleString('es-BO', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Desglose */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Monto pagado</span>
                  <span className="font-bold text-slate-800">Bs. {preview.boleto.monto_pagado}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Penalización ({preview.cancelacion.porcentaje_penalizacion}%)
                    {' · '}{preview.cancelacion.horas_restantes}h antes
                  </span>
                  <span className="font-bold text-red-500">- Bs. {preview.cancelacion.monto_penalizacion}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                  <span className="font-bold text-slate-700">A devolver</span>
                  <span className="font-black text-teal-700">Bs. {preview.cancelacion.monto_devolucion}</span>
                </div>
              </div>

              <div className="rounded-2xl!  bg-amber-50 px-4 py-3 mb-5 flex items-start gap-2 text-sm font-semibold text-amber-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                Esta acción no se puede deshacer. La devolución se procesará en días hábiles.
              </div>

              <div className="flex gap-3">
                <button onClick={onCerrar}
                  className="flex-1 rounded-2xl!  border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  No cancelar
                </button>
                <button onClick={cancelar} disabled={procesando}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl!  bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-70">
                  {procesando ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
                  {procesando ? 'Cancelando...' : 'Confirmar cancelación'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Cliente ────────────────────────────────────
export default function DashboardCliente() {
  const { usuario } = useAuth();
  const [boletos,  setBoletos]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null);
  const [filtro,   setFiltro]   = useState('todos');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await fetchMisBoletos();
      setBoletos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const activos    = boletos.filter(b => b.estado === 'Comprado').length;
  const cancelados = boletos.filter(b => b.estado === 'Cancelado').length;

  const filtrados = boletos.filter(b => {
    if (filtro === 'activos')    return b.estado === 'Comprado';
    if (filtro === 'cancelados') return b.estado === 'Cancelado';
    return true;
  });

  function puedesCancelar(boleto) {
    if (boleto.estado !== 'Comprado') return false;
    const salida = new Date(boleto.fecha_hora_salida);
    return new Date() < salida;
  }

  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="mx-auto ">

        {/* Cabecera */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              Bienvenido, {usuario.nombre} 👋
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Tus pasajes y viajes
            </p>
          </div>
          <button onClick={cargar}
            className="flex items-center gap-2 rounded-xl! border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-teal-300">
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl!  bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={16} />{error}
          </div>
        )}

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Total', valor: boletos.length, color: 'text-slate-900' },
            { label: 'Activos', valor: activos, color: 'text-green-700' },
            { label: 'Cancelados', valor: cancelados, color: 'text-red-500' },
          ].map(k => (
            <div key={k.label} className="rounded-3xl!  border border-slate-100 bg-white p-4 text-center shadow-sm">
              <p className={`text-2xl font-black ${k.color}`}>{k.valor}</p>
              <p className="text-xs font-semibold text-slate-400">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-4 flex gap-1 rounded-2xl!  border border-slate-200 bg-white p-1">
          {[
            { v: 'todos', l: 'Todos' },
            { v: 'activos', l: 'Activos' },
            { v: 'cancelados', l: 'Cancelados' },
          ].map(f => (
            <button key={f.v} onClick={() => setFiltro(f.v)}
              className={`flex-1 rounded-xl! py-2 text-sm font-bold transition
                ${filtro === f.v ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Lista boletos */}
        {cargando ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-teal-600" /></div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-3xl!  border border-slate-100 bg-white py-16 text-center shadow-sm">
            <Ticket size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">No tienes boletos aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(b => (
              <div key={b.id} className={`rounded-3xl!  border bg-white shadow-sm overflow-hidden
                ${b.estado === 'Cancelado' ? 'border-slate-100 opacity-70' : 'border-slate-100'}`}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <span className="text-xs font-bold text-slate-500">{b.codigo_boleto}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badgeBoleto(b.estado)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {b.estado}
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xl font-black leading-none text-slate-900">
                        {new Date(b.fecha_hora_salida).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{b.origen}</p>
                    </div>
                    <div className="flex flex-1 items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <div className="h-px flex-1 border-t border-dashed border-slate-300" />
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black leading-none text-slate-900">
                        {b.fecha_hora_llegada
                          ? new Date(b.fecha_hora_llegada).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{b.destino}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{new Date(b.fecha_hora_salida).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>Asiento {b.numero_asiento}</span>
                    <span>·</span>
                    <span>{b.placa} · {b.tipo_bus}</span>
                    <span>·</span>
                    <span className="font-bold text-teal-700">Bs. {b.monto_pagado}</span>
                  </div>
                </div>

                {/* Cancelar */}
                {puedesCancelar(b) && (
                  <div className="border-t border-slate-100 px-5 py-3">
                    <button onClick={() => setModal(b)}
                      className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600">
                      <XCircle size={15} /> Cancelar este boleto
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ModalCancelacion
          boleto={modal}
          onCerrar={() => setModal(null)}
          onCancelado={cargar}
        />
      )}
    </div>
  );
}