import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, BusFront, CheckCircle2, Loader2 } from 'lucide-react';
import { recuperarPassword } from '../../api/authApi';

export default function RecuperarPassword() {
  const [correo,   setCorreo]   = useState('');
  const [enviado,  setEnviado]  = useState(false);
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await recuperarPassword(correo);
      setEnviado(true);
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

          {!enviado ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                  <Mail size={24} className="text-teal-700" />
                </div>
                <h2 className="text-xl font-black text-slate-900">¿Olvidaste tu contraseña?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ingresa tu correo y te enviaremos las instrucciones
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={enviar}>
                <div className="mb-4">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={correo}
                      onChange={e => setCorreo(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-bold text-white transition hover:bg-teal-600 disabled:opacity-70"
                >
                  {cargando ? (
                    <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                  ) : (
                    'Enviar instrucciones'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Estado enviado */
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                <CheckCircle2 size={32} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Revisa tu correo</h2>
              <p className="mt-2 text-sm text-slate-500">
                Si <span className="font-semibold text-slate-700">{correo}</span> está registrado,
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="mt-1 text-xs text-slate-400">Revisa también tu carpeta de spam.</p>
            </div>
          )}

        </div>

        <div className="mt-5 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-700 transition"
          >
            <ArrowLeft size={15} /> Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}