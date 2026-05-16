import { useEffect, useState } from 'react';
import {
  Bus, Pencil, Power, PowerOff, Wrench,
  X, Loader2, Search, RefreshCw, ChevronDown,
  Plus, AlertTriangle, CheckCircle2, Eye
} from 'lucide-react';
import {
  listarBuses,
  crearBus,
  actualizarBus,
  cambiarEstadoBus
} from '../../api/busesApi';

// ─────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────
const TIPOS   = ['Normal', 'Semi Cama', 'Cama'];
const ESTADOS = ['Habilitado', 'Mantenimiento', 'Inactivo'];

function badgeEstado(estado) {
  if (estado === 'Habilitado')   return 'bg-green-50 text-green-700 border border-green-200';
  if (estado === 'Mantenimiento') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-600 border border-red-200';
}

function badgeTipo(tipo) {
  if (tipo === 'Cama')      return 'bg-orange-50 text-orange-700 border border-orange-200';
  if (tipo === 'Semi Cama') return 'bg-blue-50 text-blue-700 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

function iconoEstado(estado) {
  if (estado === 'Habilitado')    return <Power size={14} />;
  if (estado === 'Mantenimiento') return <Wrench size={14} />;
  return <PowerOff size={14} />;
}

function formVacio() {
  return { placa: '', modelo: '', capacidad: '', tipo_bus: 'Normal', estado: 'Habilitado' };
}

function validar(form) {
  const e = {};
  if (!form.placa.trim())    e.placa    = 'La placa es obligatoria';
  else if (!/^[A-Z0-9\-]{4,10}$/i.test(form.placa.trim())) e.placa = 'Formato inválido (ej: 1234-ABC)';
  if (!form.modelo.trim())   e.modelo   = 'El modelo es obligatorio';
  if (!form.capacidad)       e.capacidad = 'La capacidad es obligatoria';
  else if (Number(form.capacidad) < 10 || Number(form.capacidad) > 100)
    e.capacidad = 'Debe estar entre 10 y 100';
  if (!form.tipo_bus)  e.tipo_bus = 'El tipo es obligatorio';
  if (!form.estado)    e.estado   = 'El estado es obligatorio';
  return e;
}

// ─────────────────────────────────────────────────────────
// Componentes base
// ─────────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children, ancho = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className={`w-full ${ancho} rounded-3xl! bg-white shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-base font-black text-slate-800">{titulo}</p>
          <button
            onClick={onCerrar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Campo({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertTriangle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function InputField({ error, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
        focus:border-teal-500 focus:ring-2 focus:ring-teal-100
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} ${className}`}
    />
  );
}

function SelectField({ error, children, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
          focus:border-teal-500 focus:ring-2 focus:ring-teal-100
          ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} ${className}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Crear
// ─────────────────────────────────────────────────────────
function ModalCrear({ onCerrar, onGuardado }) {
  const [form, setForm]           = useState(formVacio());
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errores[name]) setErrores(e => ({ ...e, [name]: '' }));
  }

  async function guardar(e) {
    e.preventDefault();
    const errs = validar(form);
    if (Object.keys(errs).length) { setErrores(errs); return; }
    setGuardando(true);
    try {
      await crearBus({ ...form, capacidad: Number(form.capacidad) });
      onGuardado('Bus registrado correctamente.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Registrar nuevo bus" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        {errores.general && (
          <div className="col-span-2 flex items-center gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={15} /> {errores.general}
          </div>
        )}

        <Campo label="Placa *" error={errores.placa}>
          <InputField name="placa" value={form.placa} onChange={cambiar}
            placeholder="1234-ABC" error={errores.placa}
            style={{ textTransform: 'uppercase' }} />
        </Campo>

        <Campo label="Modelo *" error={errores.modelo}>
          <InputField name="modelo" value={form.modelo} onChange={cambiar}
            placeholder="Mercedes Benz O-500" error={errores.modelo} />
        </Campo>

        <Campo label="Capacidad (asientos) *" error={errores.capacidad}>
          <InputField type="number" name="capacidad" value={form.capacidad}
            onChange={cambiar} placeholder="48" min="10" max="100" error={errores.capacidad} />
        </Campo>

        <Campo label="Tipo de bus *" error={errores.tipo_bus}>
          <SelectField name="tipo_bus" value={form.tipo_bus} onChange={cambiar}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </SelectField>
        </Campo>

        <div className="col-span-2">
          <Campo label="Estado inicial *" error={errores.estado}>
            <SelectField name="estado" value={form.estado} onChange={cambiar}>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </Campo>
        </div>

        <div className="col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCerrar}
            className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={guardando}
            className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {guardando ? 'Guardando...' : 'Registrar bus'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Editar
// ─────────────────────────────────────────────────────────
function ModalEditar({ bus, onCerrar, onGuardado }) {
  const [form, setForm]           = useState({
    placa:    bus.placa    || '',
    modelo:   bus.modelo   || '',
    capacidad: String(bus.capacidad || ''),
    tipo_bus: bus.tipo_bus || 'Normal',
    estado:   bus.estado   || 'Habilitado',
  });
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errores[name]) setErrores(e => ({ ...e, [name]: '' }));
  }

  async function guardar(e) {
    e.preventDefault();
    const errs = validar(form);
    if (Object.keys(errs).length) { setErrores(errs); return; }
    setGuardando(true);
    try {
      await actualizarBus(bus.id, { ...form, capacidad: Number(form.capacidad) });
      onGuardado('Bus actualizado correctamente.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Editar · ${bus.placa}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        {errores.general && (
          <div className="col-span-2 flex items-center gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={15} /> {errores.general}
          </div>
        )}

        <Campo label="Placa *" error={errores.placa}>
          <InputField name="placa" value={form.placa} onChange={cambiar}
            error={errores.placa} style={{ textTransform: 'uppercase' }} />
        </Campo>

        <Campo label="Modelo *" error={errores.modelo}>
          <InputField name="modelo" value={form.modelo} onChange={cambiar} error={errores.modelo} />
        </Campo>

        <Campo label="Capacidad (asientos) *" error={errores.capacidad}>
          <InputField type="number" name="capacidad" value={form.capacidad}
            onChange={cambiar} min="10" max="100" error={errores.capacidad} />
        </Campo>

        <Campo label="Tipo de bus *" error={errores.tipo_bus}>
          <SelectField name="tipo_bus" value={form.tipo_bus} onChange={cambiar}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </SelectField>
        </Campo>

        <div className="col-span-2">
          <Campo label="Estado *" error={errores.estado}>
            <SelectField name="estado" value={form.estado} onChange={cambiar}>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </SelectField>
          </Campo>
        </div>

        <div className="col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCerrar}
            className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={guardando}
            className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Ver detalle
// ─────────────────────────────────────────────────────────
function ModalVer({ bus, onCerrar }) {
  const fila = (label, valor) => (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{valor || '—'}</span>
    </div>
  );

  return (
    <Modal titulo="Detalle del bus" onCerrar={onCerrar}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl! bg-teal-100 text-teal-700">
          <Bus size={24} />
        </div>
        <div>
          <p className="font-black text-slate-900">{bus.placa}</p>
          <p className="text-xs text-slate-400">{bus.modelo || 'Sin modelo'}</p>
        </div>
      </div>
      <div className="rounded-2xl! border border-slate-100 px-4">
        {fila('Placa', bus.placa)}
        {fila('Modelo', bus.modelo)}
        {fila('Capacidad', `${bus.capacidad} asientos`)}
        {fila('Tipo', bus.tipo_bus)}
        {fila('Estado', bus.estado)}
      </div>
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
// Modal Cambiar Estado
// ─────────────────────────────────────────────────────────
function ModalEstado({ bus, onCerrar, onGuardado }) {
  const [estado, setEstado]       = useState(bus.estado);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  async function guardar() {
    if (estado === bus.estado) { onCerrar(); return; }
    setGuardando(true);
    try {
      await cambiarEstadoBus(bus.id, estado);
      onGuardado(`Estado cambiado a ${estado}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const colorEstado = {
    Habilitado:    'border-green-500 bg-green-50 text-green-800',
    Mantenimiento: 'border-amber-500 bg-amber-50 text-amber-800',
    Inactivo:      'border-red-400 bg-red-50 text-red-800',
  };

  return (
    <Modal titulo={`Estado · ${bus.placa}`} onCerrar={onCerrar}>
      <p className="mb-4 text-sm text-slate-500">
        Estado actual: <span className="font-bold text-slate-700">{bus.estado}</span>
      </p>

      <div className="mb-5 grid gap-3">
        {ESTADOS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setEstado(s)}
            className={`flex items-center gap-3 rounded-2xl! border-2 px-4 py-3 text-sm font-bold transition
              ${estado === s ? colorEstado[s] : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
          >
            {iconoEstado(s)}
            {s}
            {estado === s && <span className="ml-auto text-xs font-semibold opacity-70">Seleccionado</span>}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-xl! bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button onClick={onCerrar}
          className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
        <button onClick={guardar} disabled={guardando}
          className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
          {guardando ? 'Aplicando...' : 'Aplicar estado'}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────
export default function Buses() {
  const [buses, setBuses]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [filtroTipo, setFiltroTipo]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal]         = useState(null);
  const [toast, setToast]         = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const data = await listarBuses();
      setBuses(data);
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

  const filtrados = buses.filter(b => {
    const txt = busqueda.toLowerCase();
    const coincide = !txt || b.placa?.toLowerCase().includes(txt) || b.modelo?.toLowerCase().includes(txt);
    const tipo   = !filtroTipo   || b.tipo_bus === filtroTipo;
    const estado = !filtroEstado || b.estado   === filtroEstado;
    return coincide && tipo && estado;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto ">

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
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Flota de buses</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Gestión y control de la flota vehicular
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={cargar}
              className="flex h-10 w-10 items-center justify-center rounded-xl! border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setModal({ tipo: 'crear' })}
              className="flex items-center gap-2 rounded-xl! bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600">
              <Plus size={16} />
              Registrar bus
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por placa o modelo..."
              className="w-full rounded-xl! border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
            />
          </div>

          <div className="relative">
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="appearance-none rounded-xl! border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-teal-400">
              <option value="">Todos los tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              className="appearance-none rounded-xl! border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-teal-400">
              <option value="">Todos los estados</option>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
              <p className="text-sm font-semibold">Cargando flota...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center">
              <Bus size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">No se encontraron buses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Bus', 'Capacidad', 'Tipo', 'Estado', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map(bus => (
                    <tr key={bus.id} className="transition hover:bg-slate-50/60">

                      {/* Bus */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl! bg-teal-100 text-teal-700">
                            <Bus size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{bus.placa}</p>
                            <p className="text-xs text-slate-400">{bus.modelo || 'Sin modelo'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Capacidad */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-700">
                          {bus.capacidad} asientos
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeTipo(bus.tipo_bus)}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {bus.tipo_bus}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeEstado(bus.estado)}`}>
                          {iconoEstado(bus.estado)}
                          {bus.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ tipo: 'ver', bus })}
                            title="Ver detalle"
                            className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setModal({ tipo: 'editar', bus })}
                            title="Editar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-teal-50 hover:text-teal-700">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setModal({ tipo: 'estado', bus })}
                            title="Cambiar estado"
                            className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                            <Wrench size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!cargando && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs font-medium text-slate-400">
                {filtrados.length} de {buses.length} buses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {modal?.tipo === 'crear'  && <ModalCrear  onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'editar' && <ModalEditar bus={modal.bus} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'ver'    && <ModalVer    bus={modal.bus} onCerrar={() => setModal(null)} />}
      {modal?.tipo === 'estado' && <ModalEstado bus={modal.bus} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
    </div>
  );
}