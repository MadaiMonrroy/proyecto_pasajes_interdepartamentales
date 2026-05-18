import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/auth/Login';
import RegistroCliente from '../pages/auth/RegistroCliente';
import RecuperarPassword from '../pages/auth/RecuperarPassword';
import CambiarPassword from '../pages/auth/CambiarPassword';

import AdminLayout from '../layouts/AdminLayout';
import EncargadoLayout from '../layouts/EncargadoLayout';
import ClienteLayout from '../layouts/ClienteLayout';

import DashboardAdmin from '../pages/admin/DashboardAdmin';
import DashboardEncargado from '../pages/encargado/DashboardEncargado';
import DashboardCliente from '../pages/cliente/DashboardCliente';
import UsuariosPersonal from '../pages/admin/UsuariosPersonal';
import Buses from '../pages/admin/Buses';
import Viajes from '../pages/admin/Viajes';
import Precios from '../pages/encargado/Precios';
import ComprarPasaje from '../pages/cliente/ComprarPasaje';
import MisBoletos from '../pages/cliente/MisBoletos';
import VentasSucursal from '../pages/encargado/VentasSucursal';
import VenderPasaje from '../pages/encargado/VenderPasaje';
import ConfirmarCorreo from '../pages/auth/ConfirmarCorreo';
import RestablecerPassword from '../pages/auth/RestablecerPassword';
function RutaPrivada({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return usuario ? children : <Navigate to="/login" />;
}

function RedireccionInicial() {
  const { usuario, loading } = useAuth(); // ← agregar loading

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );

  if (!usuario) return <Navigate to="/login" />;

  if (usuario.rol === 'Administrador') return <Navigate to="/admin" />;
  if (usuario.rol === 'Encargado') return <Navigate to="/encargado" />;
  return <Navigate to="/cliente" />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedireccionInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegistroCliente />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/confirmar-correo" element={<ConfirmarCorreo />} />
<Route path="/restablecer-password" element={<RestablecerPassword />} />

        <Route
          path="/admin"
          element={
            <RutaPrivada>
              <AdminLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="usuarios" element={<UsuariosPersonal />} />
          <Route path="buses" element={<Buses />} />
  <Route path="viajes" element={<Viajes />} />
        </Route>

        <Route
          path="/encargado"
          element={
            <RutaPrivada>
              <EncargadoLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<DashboardEncargado />} />
           <Route path="precios" element={<Precios />} />
           <Route path="ventas" element={<VentasSucursal />} />
           <Route path="vender" element={<VenderPasaje />} />
        </Route>

        <Route
          path="/cliente"
          element={
            <RutaPrivada>
              <ClienteLayout />
            </RutaPrivada>
          }
        >
          <Route index element={<DashboardCliente />} />
          <Route path="comprar" element={<ComprarPasaje />} />
<Route path="mis-boletos" element={<MisBoletos />} />
        </Route>

        <Route
          path="/cambiar-password"
          element={
            <RutaPrivada>
              <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <CambiarPassword />
              </div>
            </RutaPrivada>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}