import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarCliente } from '../../api/authApi';
import { BusFront, User, Mail, Lock, IdCard, CalendarDays } from 'lucide-react';

export default function RegistroCliente() {

  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: '',
    ci: '',
    correo: '',
    password: '',
    fecha_nacimiento: ''
  });

  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const manejarRegistro = async (e) => {

    e.preventDefault();

    try {

      setCargando(true);

      await registrarCliente(formulario);

      alert('Cuenta creada correctamente. Revisa tu correo.');

      navigate('/login');

    } catch (error) {

      alert(error.message || 'Error al registrar');

    } finally {

      setCargando(false);

    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 shadow-lg shadow-teal-200">
              <BusFront size={24} color="white" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-teal-900">
                ViaGo
              </h1>
              <p className="text-xs text-slate-400">
                Sistema de Pasajes
              </p>
            </div>

          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">

          <div className="mb-7 text-center">

            <h2 className="text-2xl font-black text-slate-900">
              Crear cuenta
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registra tus datos para continuar
            </p>

          </div>

          <form onSubmit={manejarRegistro} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre completo
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="nombre"
                  placeholder="Ingresa tu nombre"
                  onChange={manejarCambio}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

              </div>
            </div>

            {/* CI */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Carnet de identidad
              </label>

              <div className="relative">

                <IdCard
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="ci"
                  placeholder="Ej: 12345678"
                  onChange={manejarCambio}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo electrónico
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="correo"
                  placeholder="correo@ejemplo.com"
                  onChange={manejarCambio}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={manejarCambio}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fecha de nacimiento
              </label>

              <div className="relative">

                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  name="fecha_nacimiento"
                  onChange={manejarCambio}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                />

              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="mt-2 w-full rounded-2xl bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cargando ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">
              ¿Ya tienes una cuenta?
            </p>

            <Link
              to="/login"
              className="mt-1 inline-block text-sm font-bold text-teal-700 hover:text-teal-600"
            >
              Iniciar sesión
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}