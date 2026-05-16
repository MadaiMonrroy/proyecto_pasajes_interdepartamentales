import { useEffect, useState } from 'react';
import {
  UserPlus, Pencil, Eye, EyeOff, Power, PowerOff,
  Mail, X, Loader2, Search, RefreshCw, ChevronDown,
  ShieldCheck, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  deshabilitarUsuario,
  habilitarUsuario,
  reenviarActivacion
} from '../../api/usuariosApi';

// ─────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────
const SUCURSALES = ['La Paz', 'Cochabamba', 'Santa Cruz'];
const ROLES      = ['Encargado', 'Administrador'];

function badgeEstado(estado) {
  if (estado === 'Activo')   return 'bg-green-50 text-green-700 border border-green-200';
  if (estado === 'Pendiente') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-600 border border-red-200';
}

function badgeRol(rol) {
  if (rol === 'Administrador') return 'bg-purple-50 text-purple-700 border border-purple-200';
  return 'bg-blue-50 text-blue-700 border border-blue-200';
}

function formVacio() {
  return {
    nombre: '', apellidos: '', ci: '', telefono: '',
    correo: '', password: '', rol: 'Encargado', sucursal: 'Cochabamba'
  };
}

// ─────────────────────────────────────────────────────────
// Modal contenedor genérico
// ─────────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children, ancho = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
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

// ─────────────────────────────────────────────────────────
// Campo de formulario
// ─────────────────────────────────────────────────────────
function Campo({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
        focus:border-teal-500 focus:ring-2 focus:ring-teal-100
        ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
    />
  );
}

function Select({ error, children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-xl! border px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition
          focus:border-teal-500 focus:ring-2 focus:ring-teal-100
          ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Validación
// ─────────────────────────────────────────────────────────
function validarForm(form, esEdicion = false) {
  const errores = {};
  if (!form.nombre.trim())  errores.nombre  = 'El nombre es obligatorio';
  if (!form.ci.trim())      errores.ci      = 'El CI es obligatorio';
  if (!form.correo.trim())  errores.correo  = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errores.correo = 'Correo inválido';
  if (!form.rol)            errores.rol     = 'El rol es obligatorio';
  if (form.rol === 'Encargado' && !form.sucursal) errores.sucursal = 'La sucursal es obligatoria';
  if (!esEdicion && !form.password.trim()) errores.password = 'La contraseña es obligatoria';
  if (!esEdicion && form.password && form.password.length < 6) errores.password = 'Mínimo 6 caracteres';
  if (form.telefono && !/^\+?[\d\s\-]{6,15}$/.test(form.telefono)) errores.telefono = 'Teléfono inválido';
  return errores;
}

// ─────────────────────────────────────────────────────────
// Modal Crear
// ─────────────────────────────────────────────────────────
function ModalCrear({ onCerrar, onGuardado }) {
  const [form, setForm]         = useState(formVacio());
  const [errores, setErrores]   = useState({});
  const [guardando, setGuardando] = useState(false);
  const [verPass, setVerPass]   = useState(false);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errores[name]) setErrores(e => ({ ...e, [name]: '' }));
  }

  async function guardar(e) {
    e.preventDefault();
    const errs = validarForm(form);
    if (Object.keys(errs).length) { setErrores(errs); return; }

    setGuardando(true);
    try {
      await crearUsuario(form);
      onGuardado('Usuario creado. Se envió el correo de activación.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Nuevo usuario" onCerrar={onCerrar} ancho="max-w-2xl">
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">

        {errores.general && (
          <div className="col-span-2 flex items-center gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={16} /> {errores.general}
          </div>
        )}

        <Campo label="Nombre *" error={errores.nombre}>
          <Input name="nombre" value={form.nombre} onChange={cambiar} placeholder="Juan" error={errores.nombre} />
        </Campo>

        <Campo label="Apellidos" error={errores.apellidos}>
          <Input name="apellidos" value={form.apellidos} onChange={cambiar} placeholder="Pérez López" />
        </Campo>

        <Campo label="CI *" error={errores.ci}>
          <Input name="ci" value={form.ci} onChange={cambiar} placeholder="8468750" error={errores.ci} />
        </Campo>

        <Campo label="Teléfono" error={errores.telefono}>
          <Input name="telefono" value={form.telefono} onChange={cambiar} placeholder="70123456" error={errores.telefono} />
        </Campo>

        <Campo label="Correo electrónico *" error={errores.correo}>
          <Input type="email" name="correo" value={form.correo} onChange={cambiar} placeholder="juan@empresa.com" error={errores.correo} />
        </Campo>

        <Campo label="Contraseña temporal *" error={errores.password}>
          <div className="relative">
            <Input
              type={verPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={cambiar}
              placeholder="Mínimo 6 caracteres"
              error={errores.password}
            />
            <button
              type="button"
              onClick={() => setVerPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Campo>

        <Campo label="Rol *" error={errores.rol}>
          <Select name="rol" value={form.rol} onChange={cambiar}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Campo>

        <Campo label="Sucursal" error={errores.sucursal}>
          <Select
            name="sucursal"
            value={form.sucursal}
            onChange={cambiar}
            disabled={form.rol !== 'Encargado'}
            error={errores.sucursal}
          >
            {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Campo>

        <div className="col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCerrar} className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70"
          >
            {guardando ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {guardando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Modal Editar
// ─────────────────────────────────────────────────────────
function ModalEditar({ usuario, onCerrar, onGuardado }) {
  const [form, setForm]           = useState({
    nombre:    usuario.nombre    || '',
    apellidos: usuario.apellidos || '',
    ci:        usuario.ci        || '',
    telefono:  usuario.telefono  || '',
    correo:    usuario.correo    || '',
    rol:       usuario.rol       || 'Encargado',
    sucursal:  usuario.sucursal  || 'Cochabamba',
    estado:    usuario.estado    || 'Activo',
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
    const errs = validarForm(form, true);
    if (Object.keys(errs).length) { setErrores(errs); return; }

    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, form);
      onGuardado('Usuario actualizado correctamente.');
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Editar · ${usuario.nombre}`} onCerrar={onCerrar} ancho="max-w-2xl">
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">

        {errores.general && (
          <div className="col-span-2 flex items-center gap-2 rounded-xl! bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={16} /> {errores.general}
          </div>
        )}

        <Campo label="Nombre *" error={errores.nombre}>
          <Input name="nombre" value={form.nombre} onChange={cambiar} error={errores.nombre} />
        </Campo>

        <Campo label="Apellidos" error={errores.apellidos}>
          <Input name="apellidos" value={form.apellidos} onChange={cambiar} />
        </Campo>

        <Campo label="CI *" error={errores.ci}>
          <Input name="ci" value={form.ci} onChange={cambiar} error={errores.ci} />
        </Campo>

        <Campo label="Teléfono" error={errores.telefono}>
          <Input name="telefono" value={form.telefono} onChange={cambiar} error={errores.telefono} />
        </Campo>

        <Campo label="Correo electrónico *" error={errores.correo}>
          <Input type="email" name="correo" value={form.correo} onChange={cambiar} error={errores.correo} />
        </Campo>

        <Campo label="Estado">
          <Select name="estado" value={form.estado} onChange={cambiar}>
            <option value="Activo">Activo</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Inactivo">Inactivo</option>
          </Select>
        </Campo>

        <Campo label="Rol *" error={errores.rol}>
          <Select name="rol" value={form.rol} onChange={cambiar}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Campo>

        <Campo label="Sucursal" error={errores.sucursal}>
          <Select name="sucursal" value={form.sucursal} onChange={cambiar} disabled={form.rol !== 'Encargado'}>
            {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Campo>

        <div className="col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCerrar} className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 rounded-xl! bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-70"
          >
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
function ModalVer({ usuario, onCerrar }) {
  const fila = (label, valor) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right">{valor || '—'}</span>
    </div>
  );

  return (
    <Modal titulo="Detalle de usuario" onCerrar={onCerrar}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl! bg-teal-100 text-teal-700 font-black text-lg">
          {usuario.nombre[0]}{usuario.apellidos?.[0] || ''}
        </div>
        <div>
          <p className="font-black text-slate-900">{usuario.nombre} {usuario.apellidos}</p>
          <p className="text-xs text-slate-400">{usuario.correo}</p>
        </div>
      </div>

      <div className="rounded-2xl! border border-slate-100 px-4">
        {fila('CI', usuario.ci)}
        {fila('Teléfono', usuario.telefono)}
        {fila('Rol', usuario.rol)}
        {fila('Sucursal', usuario.sucursal)}
        {fila('Estado', usuario.estado)}
        {fila('Creado', usuario.fecha_creacion ? new Date(usuario.fecha_creacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }) : null)}
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
// Modal Confirmar acción (deshabilitar / habilitar)
// ─────────────────────────────────────────────────────────
function ModalConfirmar({ usuario, accion, onCerrar, onConfirmado }) {
  const [procesando, setProcesando] = useState(false);
  const deshabilitar = accion === 'deshabilitar';

  async function confirmar() {
    setProcesando(true);
    try {
      if (deshabilitar) await deshabilitarUsuario(usuario.id);
      else              await habilitarUsuario(usuario.id);
      onConfirmado(deshabilitar ? 'Usuario deshabilitado.' : 'Usuario habilitado.');
    } catch (err) {
      onCerrar();
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Modal titulo={deshabilitar ? 'Deshabilitar usuario' : 'Habilitar usuario'} onCerrar={onCerrar}>
      <div className={`mb-5 flex items-center gap-3 rounded-2xl! p-4 ${deshabilitar ? 'bg-red-50' : 'bg-green-50'}`}>
        {deshabilitar
          ? <PowerOff size={20} className="shrink-0 text-red-500" />
          : <Power size={20} className="shrink-0 text-green-600" />
        }
        <p className={`text-sm font-semibold ${deshabilitar ? 'text-red-700' : 'text-green-700'}`}>
          ¿{deshabilitar ? 'Deshabilitar' : 'Habilitar'} a <strong>{usuario.nombre} {usuario.apellidos}</strong>?
          {deshabilitar && ' No podrá iniciar sesión.'}
        </p>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCerrar} className="rounded-xl! border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={procesando}
          className={`flex items-center gap-2 rounded-xl! px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70
            ${deshabilitar ? 'bg-red-600 hover:bg-red-500' : 'bg-teal-700 hover:bg-teal-600'}`}
        >
          {procesando ? <Loader2 size={15} className="animate-spin" /> : (deshabilitar ? <PowerOff size={15} /> : <Power size={15} />)}
          {procesando ? 'Procesando...' : (deshabilitar ? 'Deshabilitar' : 'Habilitar')}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────
export default function UsuariosPersonal() {
  const [usuarios, setUsuarios]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [busqueda, setBusqueda]   = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null); // { tipo, usuario? }

  // ── Cargar ──
  async function cargar() {
    setCargando(true);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      mostrarToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  // ── Toast ──
  function mostrarToast(mensaje, tipo = 'ok') {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 4000);
  }

  function onGuardado(msg) {
    setModal(null);
    cargar();
    mostrarToast(msg);
  }

  // ── Reenviar activación ──
  async function reenviar(usuario) {
    try {
      await reenviarActivacion(usuario.id);
      mostrarToast('Correo de activación reenviado.');
    } catch (err) {
      mostrarToast(err.message, 'error');
    }
  }

  // ── Filtrado ──
  const filtrados = usuarios.filter(u => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto || (
      u.nombre?.toLowerCase().includes(texto) ||
      u.apellidos?.toLowerCase().includes(texto) ||
      u.correo?.toLowerCase().includes(texto) ||
      u.ci?.toLowerCase().includes(texto)
    );
    const coincideRol    = !filtroRol    || u.rol    === filtroRol;
    const coincideEstado = !filtroEstado || u.estado === filtroEstado;
    return coincideTexto && coincideRol && coincideEstado;
  });

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto ">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl! px-5 py-3.5 shadow-lg
            ${toast.tipo === 'error' ? 'bg-red-600' : 'bg-teal-700'} text-white`}>
            {toast.tipo === 'error'
              ? <AlertTriangle size={18} />
              : <CheckCircle2 size={18} />
            }
            <span className="text-sm font-semibold">{toast.mensaje}</span>
          </div>
        )}

        {/* Cabecera */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Personal</h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Administradores y encargados del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargar}
              className="flex h-10 w-10 items-center justify-center rounded-xl! border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setModal({ tipo: 'crear' })}
              className="flex items-center gap-2 rounded-xl! bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600"
            >
              <UserPlus size={16} />
              Nuevo usuario
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, CI o correo..."
              className="w-full rounded-xl! border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
            />
          </div>

          <div className="relative">
            <select
              value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}
              className="appearance-none rounded-xl! border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
            >
              <option value="">Todos los roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="appearance-none rounded-xl! border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-teal-400"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-3xl! border border-slate-100 bg-white shadow-sm">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={28} className="mb-3 animate-spin text-teal-600" />
              <p className="text-sm font-semibold">Cargando usuarios...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              No se encontraron usuarios.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Usuario', 'CI', 'Contacto', 'Rol', 'Sucursal', 'Estado', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtrados.map(u => (
                    <tr key={u.id} className="group transition hover:bg-slate-50/60">
                      {/* Usuario */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl! bg-teal-100 text-sm font-black text-teal-700">
                            {u.nombre?.[0]}{u.apellidos?.[0] || ''}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {u.nombre} {u.apellidos}
                            </p>
                            <p className="text-xs text-slate-400">{u.correo}</p>
                          </div>
                        </div>
                      </td>

                      {/* CI */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-slate-600">{u.ci}</span>
                      </td>

                      {/* Contacto */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{u.telefono || '—'}</span>
                      </td>

                      {/* Rol */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeRol(u.rol)}`}>
                          <ShieldCheck size={11} />
                          {u.rol}
                        </span>
                      </td>

                      {/* Sucursal */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-500">{u.sucursal || '—'}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeEstado(u.estado)}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {u.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* Ver */}
                          <button
                            onClick={() => setModal({ tipo: 'ver', usuario: u })}
                            title="Ver detalle"
                            className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => setModal({ tipo: 'editar', usuario: u })}
                            title="Editar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Reenviar activación (solo Pendiente) */}
                          {u.estado === 'Pendiente' && (
                            <button
                              onClick={() => reenviar(u)}
                              title="Reenviar correo de activación"
                              className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Mail size={15} />
                            </button>
                          )}

                          {/* Deshabilitar / Habilitar */}
                          {u.estado !== 'Pendiente' && (
                            u.estado === 'Activo' ? (
                              <button
                                onClick={() => setModal({ tipo: 'confirmar', accion: 'deshabilitar', usuario: u })}
                                title="Deshabilitar"
                                className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <PowerOff size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setModal({ tipo: 'confirmar', accion: 'habilitar', usuario: u })}
                                title="Habilitar"
                                className="flex h-8 w-8 items-center justify-center rounded-xl! text-slate-400 hover:bg-green-50 hover:text-green-600"
                              >
                                <Power size={15} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer con contador */}
          {!cargando && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs font-medium text-slate-400">
                {filtrados.length} de {usuarios.length} usuarios
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {modal?.tipo === 'crear' && (
        <ModalCrear onCerrar={() => setModal(null)} onGuardado={onGuardado} />
      )}
      {modal?.tipo === 'editar' && (
        <ModalEditar usuario={modal.usuario} onCerrar={() => setModal(null)} onGuardado={onGuardado} />
      )}
      {modal?.tipo === 'ver' && (
        <ModalVer usuario={modal.usuario} onCerrar={() => setModal(null)} />
      )}
      {modal?.tipo === 'confirmar' && (
        <ModalConfirmar
          usuario={modal.usuario}
          accion={modal.accion}
          onCerrar={() => setModal(null)}
          onConfirmado={onGuardado}
        />
      )}
    </div>
  );
}