import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, BusFront, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { restablecerPassword } from '../../api/authApi';

export default function RestablecerPassword() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();

  const [passwordNuevo,  setPasswordNuevo]  = useState('');
  const [confirmar,      setConfirmar]      = useState('');
  const [verNuevo,       setVerNuevo]       = useState(false);
  const [verConfirmar,   setVerConfirmar]   = useState(false);
  const [error,          setError]          = useState('');
  const [exito,          setExito]          = useState(false);
  const [cargando,       setCargando]       = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setError('');

    const token = params.get('token');
    if (!token) { setError('Token no proporcionado.'); return; }

    if (passwordNuevo.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (passwordNuevo !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await restablecerPassword(token, passwordNuevo);
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 shadow-lg shadow-teal-200">
              <BusFront size={22} color="white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-teal-900">ViaGo</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">

          {!exito ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                  <Lock size={24} className="text-teal-700" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Nueva contraseña</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Elige una contraseña segura de al menos 6 caracteres
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  <AlertTriangle size={15} className="shrink-0" />{error}
                </div>
              )}

              <form onSubmit={guardar} className="space-y-4">

                {/* Nueva contraseña */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={verNuevo ? 'text' : 'password'}
                      value={passwordNuevo}
                      onChange={e => setPasswordNuevo(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setVerNuevo(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {verNuevo ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={verConfirmar ? 'text' : 'password'}
                      value={confirmar}
                      onChange={e => setConfirmar(e.target.value)}
                      placeholder="Repite la contraseña"
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
                    'Guardar nueva contraseña'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Éxito */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                <CheckCircle2 size={32} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">¡Contraseña actualizada!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full rounded-2xl bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-600"
              >
                Ir al login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}