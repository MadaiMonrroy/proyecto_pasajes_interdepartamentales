import { useEffect, useState } from 'react';
import {
  RouteOff, Pencil, Eye, X, Loader2, Search,
  RefreshCw, ChevronDown, Plus, AlertTriangle,
  CheckCircle2, Clock, Ban, CircleCheck,
  Navigation, CalendarDays, Bus
} from 'lucide-react';
import { listarBuses } from '../../api/busesApi';
import {
  listarViajes,
  crearViaje,
  actualizarViaje,
  cambiarEstadoViaje
} from '../../api/viajesApi';

// ─────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────
const DEPARTAMENTOS = ['La Paz', 'Cochabamba', 'Santa Cruz'];

const ESTADOS_VIAJE = [
  { valor: 'Disponible',           label: 'Disponible',            color: 'bg-green-50 text-green-700 border-green-200',   icono: <CheckCircle2 size={13} /> },
  { valor: 'En curso',             label: 'En curso',              color: 'bg-blue-50 text-blue-700 border-blue-200',      icono: <Navigation size={13} /> },
  { valor: 'Demorado',             label: 'Demorado',              color: 'bg-amber-50 text-amber-700 border-amber-200',   icono: <Clock size={13} /> },
  { valor: 'Cancelado_Emergencia', label: 'Cancelado',             color: 'bg-red-50 text-red-600 border-red-200',         icono: <Ban size={13} /> },
  { valor: 'Finalizado',           label: 'Finalizado',            color: 'bg-slate-100 text-slate-500 border-slate-200',  icono: <CircleCheck size={13} /> },
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

function formatFechaInput(f) {
  if (!f) return '';
  // Convierte datetime de BDD a formato datetime-local
  return new Date(f).toISOString().slice(0, 16);
}

function formVacio() {
  return {
    id_bus: '', codigo_ruta: '',
    origen: 'La Paz', destino: 'Santa Cruz',
    fecha_hora_salida: '', fecha_hora_llegada: '',
    precio: '', estado: 'Disponible'
  };
}

function validar(form, esEdicion = false) {
  const e = {};
  if (!form.id_bus)               e.id_bus            = 'Selecciona un bus';
  if (!form.origen)               e.origen            = 'El origen es obligatorio';
  if (!form.destino)              e.destino           = 'El destino es obligatorio';
  if (form.origen === form.destino) e.destino          = 'Origen y destino no pueden ser iguales';
  if (!form.fecha_hora_salida)    e.fecha_hora_salida = 'La fecha de salida es obligatoria';
  if (!form.fecha_hora_llegada)   e.fecha_hora_llegada = 'La fecha de llegada es obligatoria';
  if (form.fecha_hora_salida && form.fecha_hora_llegada &&
      form.fecha_hora_llegada <= form.fecha_hora_salida)
    e.fecha_hora_llegada = 'La llegada debe ser posterior a la salida';
  if (!form.precio)               e.precio = 'El precio es obligatorio';
  else if (Number(form.precio) <= 0) e.precio = 'El precio debe ser mayor a 0';
  return e;
}

// ─────────────────────────────────────────────────────────
// Componentes base
// ─────────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children, ancho = 'max-w-xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div className={`w-full ${ancho} max-h-[90vh] overflow-y-auto rounded-3xl! bg-white shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <p className="text-base font-black text-slate-800">{titulo}</p>
          <button onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200">
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
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertTriangle size={11} />{error}
        </p>
      )}
    </div>
  );
}

function InputField({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
        focus:border-teal-500 focus:ring-2 focus:ring-teal-100
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
    />
  );
}

function SelectField({ error, children, disabled, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
          focus:border-teal-500 focus:ring-2 focus:ring-teal-100
          ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Formulario compartido (Crear / Editar)
// ─────────────────────────────────────────────────────────
function FormViaje({ inicial, buses, onSubmit, guardando, errores, setErrores, esEdicion = false }) {
  const [form, setForm] = useState(inicial);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errores[name]) setErrores(p => ({ ...p, [name]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {errores.general && (
        <div className="col-span-2 flex items-center gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertTriangle size={15} />{errores.general}
        </div>
      )}

      {/* Bus */}
      <div className="col-span-2">
        <Campo label="Bus asignado *" error={errores.id_bus}>
          <SelectField name="id_bus" value={form.id_bus} onChange={cambiar} error={errores.id_bus}>
            <option value="">Seleccionar bus habilitado</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>
                {b.placa} — {b.tipo_bus} ({b.capacidad} asientos)
              </option>
            ))}
          </SelectField>
        </Campo>
      </div>

      {/* Código de ruta */}
      <div className="col-span-2">
        <Campo label="Código de ruta (opcional)">
          <InputField name="codigo_ruta" value={form.codigo_ruta} onChange={cambiar}
            placeholder="Ej: CBBA-SCZ-001" />
        </Campo>
      </div>

      {/* Origen / Destino */}
      <Campo label="Origen *" error={errores.origen}>
        <SelectField name="origen" value={form.origen} onChange={cambiar} error={errores.origen}>
          {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
        </SelectField>
      </Campo>

      <Campo label="Destino *" error={errores.destino}>
        <SelectField name="destino" value={form.destino} onChange={cambiar} error={errores.destino}>
          {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
        </SelectField>
      </Campo>

      {/* Fechas */}
      <Campo label="Fecha y hora de salida *" error={errores.fecha_hora_salida}>
        <InputField type="datetime-local" name="fecha_hora_salida"
          value={form.fecha_hora_salida} onChange={cambiar} error={errores.fecha_hora_salida} />
      </Campo>

      <Campo label="Fecha y hora de llegada *" error={errores.fecha_hora_llegada}>
        <InputField type="datetime-local" name="fecha_hora_llegada"
          value={form.fecha_hora_llegada} onChange={cambiar} error={errores.fecha_hora_llegada} />
      </Campo>

      {/* Precio */}
      <Campo label="Precio (Bs.) *" error={errores.precio}>
        <InputField type="number" name="precio" value={form.precio}
          onChange={cambiar} placeholder="120" min="1" step="0.01" error={errores.precio} />
      </Campo>

      {/* Estado (solo edición) */}
      {esEdicion && (
        <Campo label="Estado">
          <SelectField name="estado" value={form.estado} onChange={cambiar}>
            {ESTADOS_VIAJE.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
          </SelectField>
        </Campo>
      )}

      <div className={`flex justify-end gap-3 border-t border-slate-100 pt-4 ${esEdicion ? '' : 'col-span-2'}`}
        style={{ gridColumn: '1 / -1' }}>
        <button type="submit" disabled={guardando}
          className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70">
          {guardando ? <Loader2 size={15} className="animate-spin" /> : (esEdicion ? <Pencil size={15} /> : <Plus size={15} />)}
          {guardando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Crear viaje')}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Crear
// ─────────────────────────────────────────────────────────
function ModalCrear({ buses, onCerrar, onGuardado }) {
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(form) {
    const errs = validar(form);
    if (Object.keys(errs).length) { setErrores(errs); return; }
    setGuardando(true);
    try {
      await crearViaje({ ...form, precio: Number(form.precio) });
      onGuardado('Viaje creado correctamente.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Nuevo viaje" onCerrar={onCerrar}>
      <FormViaje
        inicial={formVacio()}
        buses={buses}
        onSubmit={handleSubmit}
        guardando={guardando}
        errores={errores}
        setErrores={setErrores}
      />
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Editar
// ─────────────────────────────────────────────────────────
function ModalEditar({ viaje, buses, onCerrar, onGuardado }) {
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);

  const inicial = {
    id_bus:             String(viaje.id_bus),
    codigo_ruta:        viaje.codigo_ruta        || '',
    origen:             viaje.origen,
    destino:            viaje.destino,
    fecha_hora_salida:  formatFechaInput(viaje.fecha_hora_salida),
    fecha_hora_llegada: formatFechaInput(viaje.fecha_hora_llegada),
    precio:             String(viaje.precio),
    estado:             viaje.estado
  };

  async function handleSubmit(form) {
    const errs = validar(form, true);
    if (Object.keys(errs).length) { setErrores(errs); return; }
    setGuardando(true);
    try {
      await actualizarViaje(viaje.id, { ...form, precio: Number(form.precio) });
      onGuardado('Viaje actualizado correctamente.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Editar · ${viaje.origen} → ${viaje.destino}`} onCerrar={onCerrar}>
      <FormViaje
        inicial={inicial}
        buses={buses}
        onSubmit={handleSubmit}
        guardando={guardando}
        errores={errores}
        setErrores={setErrores}
        esEdicion
      />
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Ver detalle
// ─────────────────────────────────────────────────────────
function ModalVer({ viaje, onCerrar }) {
  const estado = getEstado(viaje.estado);
  const fila = (label, valor) => (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{valor || '—'}</span>
    </div>
  );

  return (
    <Modal titulo="Detalle del viaje" onCerrar={onCerrar}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl! bg-teal-100 text-teal-700">
            <Bus size={22} />
          </div>
          <div>
            <p className="font-black text-slate-900">{viaje.origen} → {viaje.destino}</p>
            <p className="text-xs text-slate-400">Bus {viaje.placa} · {viaje.tipo_bus}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${estado.color}`}>
          {estado.icono} {estado.label}
        </span>
      </div>

      <div className="rounded-2xl! border border-slate-100 px-4">
        {fila('Código ruta', viaje.codigo_ruta)}
        {fila('Bus / Placa', `${viaje.placa} (${viaje.tipo_bus})`)}
        {fila('Capacidad', `${viaje.capacidad} asientos`)}
        {fila('Salida', formatFecha(viaje.fecha_hora_salida))}
        {fila('Llegada', formatFecha(viaje.fecha_hora_llegada))}
        {fila('Precio', `Bs. ${viaje.precio}`)}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={onCerrar} className="rounded-xl! bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Cambiar estado / Cancelar ruta
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
    <Modal titulo={`Estado · ${viaje.origen} → ${viaje.destino}`} onCerrar={onCerrar}>
      <p className="mb-4 text-sm text-slate-500">
        Estado actual: <span className="font-bold text-slate-700">{getEstado(viaje.estado).label}</span>
      </p>

      <div className="mb-5 grid gap-2">
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
            {estado === e.valor && <span className="ml-auto text-xs opacity-60">Seleccionado</span>}
          </button>
        ))}
      </div>

      {/* Aviso especial para cancelación */}
      {estado === 'Cancelado_Emergencia' && (
        <div className="mb-4 flex items-start gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          Esta acción cancelará el viaje. Los pasajeros con boletos activos deberán ser notificados manualmente.
        </div>
      )}

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
          {guardando ? <Loader2 size={15} className="animate-spin" /> : <RouteOff size={15} />}
          {guardando ? 'Aplicando...' : 'Aplicar estado'}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────
export default function Viajes() {
  const [viajes, setViajes]       = useState([]);
  const [buses, setBuses]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal]         = useState(null);
  const [toast, setToast]         = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const [viajesData, busesData] = await Promise.all([listarViajes(), listarBuses()]);
      setViajes(viajesData);
      setBuses(busesData.filter(b => b.estado === 'Habilitado'));
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

  const filtrados = viajes.filter(v => {
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
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Rutas y viajes</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Gestión de viajes interdepartamentales
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
              Nuevo viaje
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
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

        {/* Tabla */}
        <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
              <p className="text-sm font-semibold">Cargando viajes...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">No se encontraron viajes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Ruta', 'Bus', 'Salida', 'Llegada', 'Precio', 'Estado', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map(viaje => {
                    const est = getEstado(viaje.estado);
                    return (
                      <tr key={viaje.id} className="transition hover:bg-slate-50/60">

                        {/* Ruta */}
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
                              <Bus size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{viaje.placa}</p>
                              <p className="text-xs text-slate-400">{viaje.tipo_bus}</p>
                            </div>
                          </div>
                        </td>

                        {/* Salida */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-slate-700">
                            {new Date(viaje.fecha_hora_salida).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(viaje.fecha_hora_salida).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                          </p>
                        </td>

                        {/* Llegada */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-slate-700">
                            {viaje.fecha_hora_llegada
                              ? new Date(viaje.fecha_hora_llegada).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {viaje.fecha_hora_llegada
                              ? new Date(viaje.fecha_hora_llegada).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
                              : ''}
                          </p>
                        </td>

                        {/* Precio */}
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-black text-teal-700">Bs. {viaje.precio}</span>
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${est.color}`}>
                            {est.icono}{est.label}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setModal({ tipo: 'ver', viaje })}
                              title="Ver detalle"
                              className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => setModal({ tipo: 'editar', viaje })}
                              title="Editar"
                              className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-teal-50 hover:text-teal-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setModal({ tipo: 'estado', viaje })}
                              title="Cambiar estado / Cancelar ruta"
                              className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-red-50 hover:text-red-600">
                              <RouteOff size={15} />
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
                {filtrados.length} de {viajes.length} viajes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {modal?.tipo === 'crear'  && <ModalCrear  buses={buses} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'editar' && <ModalEditar viaje={modal.viaje} buses={buses} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
      {modal?.tipo === 'ver'    && <ModalVer    viaje={modal.viaje} onCerrar={() => setModal(null)} />}
      {modal?.tipo === 'estado' && <ModalEstado viaje={modal.viaje} onCerrar={() => setModal(null)} onGuardado={onGuardado} />}
    </div>
  );
}