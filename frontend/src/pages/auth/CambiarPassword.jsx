import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cambiarPassword } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function CambiarPassword() {
  const navigate      = useNavigate();
  const { cerrarSesion } = useAuth();

  const [passwordActual,  setPasswordActual]  = useState('');
  const [passwordNuevo,   setPasswordNuevo]   = useState('');
  const [confirmar,       setConfirmar]       = useState('');
  const [verActual,       setVerActual]       = useState(false);
  const [verNuevo,        setVerNuevo]        = useState(false);
  const [verConfirmar,    setVerConfirmar]    = useState(false);
  const [error,           setError]           = useState('');
  const [exito,           setExito]           = useState(false);
  const [cargando,        setCargando]        = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setError('');

    if (passwordNuevo.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (passwordNuevo !== confirmar) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (passwordNuevo === passwordActual) {
      setError('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    setCargando(true);
    try {
      await cambiarPassword(passwordActual, passwordNuevo);
      setExito(true);
      // Cerrar sesión y redirigir después de 2 segundos
      setTimeout(() => {
        cerrarSesion();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const PasswordInput = ({ value, onChange, ver, setVer, placeholder, label }) => (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={ver ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="button"
          onClick={() => setVer(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {ver ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm max-w-md">

      {!exito ? (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-900">Cambiar contraseña</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Elige una contraseña segura de al menos 6 caracteres
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <AlertTriangle size={15} className="shrink-0" />{error}
            </div>
          )}

          <form onSubmit={guardar} className="space-y-4">

            <PasswordInput
              label="Contraseña actual"
              value={passwordActual}
              onChange={setPasswordActual}
              ver={verActual}
              setVer={setVerActual}
              placeholder="Tu contraseña actual"
            />

            <PasswordInput
              label="Nueva contraseña *"
              value={passwordNuevo}
              onChange={setPasswordNuevo}
              ver={verNuevo}
              setVer={setVerNuevo}
              placeholder="Mínimo 6 caracteres"
            />

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Confirmar nueva contraseña *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={verConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  className={`w-full rounded-2xl border bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:bg-white focus:ring-2
                    ${confirmar && confirmar !== passwordNuevo
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'}`}
                />
                <button
                  type="button"
                  onClick={() => setVerConfirmar(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmar && confirmar !== passwordNuevo && (
                <p className="mt-1 text-xs font-medium text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-bold text-white transition hover:bg-teal-600 disabled:opacity-70"
            >
              {cargando ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              ) : (
                'Guardar contraseña'
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 size={32} className="text-teal-600" />
          </div>
          <p className="text-lg font-black text-slate-900">¡Contraseña actualizada!</p>
          <p className="mt-1 text-sm text-slate-500">
            Cerrando sesión y redirigiendo al login...
          </p>
        </div>
      )}
    </div>
  );
}