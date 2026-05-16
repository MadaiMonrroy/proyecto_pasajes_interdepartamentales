import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmarCorreo } from '../../api/authApi';
import { BusFront } from 'lucide-react';

export default function ConfirmarCorreo() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'exito' | 'error'
  const [cuenta, setCuenta] = useState(5);

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setEstado('error'); return; }

    confirmarCorreo(token)
      .then(() => setEstado('exito'))
      .catch(() => setEstado('error'));
  }, [params]);

  // Countdown y redirect al login cuando es éxito
  useEffect(() => {
    if (estado !== 'exito') return;
    if (cuenta === 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCuenta(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [estado, cuenta, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 shadow-lg shadow-teal-200">
              <BusFront size={22} color="white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-teal-900">ViaGo</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">

          {/* Cargando */}
          {estado === 'cargando' && (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-8 w-8 animate-spin text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-700">Confirmando tu correo...</p>
              <p className="mt-1 text-sm text-slate-400">Esto tomará solo un momento</p>
            </>
          )}

          {/* Éxito */}
          {estado === 'exito' && (
            <>
              {/* Círculo con checkmark animado */}
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                <svg
                  className="h-10 w-10 text-teal-600"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="26" cy="26" r="24"
                    stroke="currentColor" strokeWidth="3"
                    strokeDasharray="150" strokeDashoffset="150"
                    style={{ animation: 'drawCircle 0.5s ease forwards' }}
                  />
                  <path
                    d="M14 26l8 9 16-18"
                    stroke="currentColor" strokeWidth="3.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="40" strokeDashoffset="40"
                    style={{ animation: 'drawCheck 0.4s ease 0.4s forwards' }}
                  />
                </svg>
              </div>

              <style>{`
                @keyframes drawCircle {
                  to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheck {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>

              <p className="text-xl font-black text-slate-900">¡Correo confirmado!</p>
              <p className="mt-1 text-sm text-slate-500">
                Tu cuenta está activa. Redirigiendo al login en{' '}
                <span className="font-bold text-teal-700">{cuenta}s</span>...
              </p>

              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full rounded-2xl bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-600 transition"
              >
                Ir al login ahora
              </button>
            </>
          )}

          {/* Error */}
          {estado === 'error' && (
            <>
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-xl font-black text-slate-900">Enlace inválido</p>
              <p className="mt-1 text-sm text-slate-500">
                El enlace expiró o ya fue usado. Solicita uno nuevo.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Ir al login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}