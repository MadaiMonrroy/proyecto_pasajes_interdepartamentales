import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';


import { useAuth } from '../context/AuthContext';


import { 
  LayoutDashboard, 
  Tags, 
  ReceiptText, 
  Ticket, 
  KeyRound, 
  LogOut, 
  Menu, 
  Bell,
  BusFront,
  Store
} from "lucide-react";

export default function EncargadoLayout() {
  const { usuario, cerrarSesion } = useAuth(); // Ti pudno a pamay-an (funcionalidad)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/encargado', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/encargado/vender', label: 'Vender Pasaje', icon: Ticket, isPrimary: true },
    { path: '/encargado/ventas', label: 'Ventas', icon: ReceiptText },
    { path: '/encargado/precios', label: 'Gestión de Precios', icon: Tags },
    { path: '/cambiar-password', label: 'Seguridad', icon: KeyRound },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Akkub para iti mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Naipamaysa ken saan a mapilpilat (shrink-0) */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 shrink-0 bg-gradient-to-b from-teal-900 to-teal-950 text-white transform transition-transform duration-300 ease-out flex flex-col shadow-2xl lg:shadow-none border-r border-teal-800/50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Tuktok ti Sidebar */}
        <div className="flex items-center justify-start gap-3 h-20 px-6 border-b border-teal-800/50 shrink-0">
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2.5 rounded-xl! shadow-lg shadow-teal-900/50">
            <BusFront size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white m-0 drop-shadow-sm whitespace-nowrap truncate">
            ViaGo
          </h1>
        </div>

        {/* Pagnagnaan a Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <p className="text-[11px] font-bold text-teal-500 uppercase tracking-widest mb-4 px-3 m-0">
            Panel Encargado
          </p>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/encargado' && location.pathname.startsWith(item.path));

              // Naidumduma a disenyo para iti kangrunaan a pindutan ("Vender Pasaje")
              if (item.isPrimary) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ textDecoration: 'none', color: '#ffffff' }}
                    className={`flex items-center gap-3 px-4 py-3.5 my-2 rounded-xl! transition-all duration-300 !no-underline outline-none shadow-md ${
                      isActive 
                        ? 'bg-emerald-500 shadow-emerald-500/30 border border-emerald-400' 
                        : 'bg-teal-600 hover:bg-emerald-500 hover:shadow-emerald-500/30 border border-teal-500'
                    }`}
                  >
                    <Icon size={22} className="text-white" />
                    <span className="font-bold text-sm m-0 text-white tracking-wide uppercase">{item.label}</span>
                  </Link>
                );
              }

              // Kadawyan a disenyo para kadagiti dadduma a silpo
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  style={{ textDecoration: 'none', color: isActive ? '#ffffff' : '#cbd5e1' }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 !no-underline outline-none group ${
                    isActive 
                      ? 'bg-teal-800/80 shadow-inner border-l-4 border-teal-400' 
                      : 'border-l-4 border-transparent hover:bg-teal-800/40 hover:!text-white'
                  }`}
                >
                  <Icon 
                    size={20} 
                    color={isActive ? "#ffffff" : "#94a3b8"}
                    className="transition-colors duration-300" 
                  />
                  <span className="font-medium text-sm m-0">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Patingga ti Sidebar agraman pakaammo ti sangay */}
        <div className="p-4 border-t border-teal-800/50 bg-teal-950/50 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <Store size={18} className="text-teal-500" />
            <div>
              <p className="text-[10px] text-teal-500/80 font-medium uppercase m-0 leading-tight">Sucursal Asignada</p>
              <p className="text-sm text-teal-100 font-bold m-0 truncate">
                {usuario?.sucursal || 'Central'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Kangrunaan a Lauk */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Tuktok a Paset (Header) */}
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl! text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors border-none bg-transparent cursor-pointer"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 m-0 tracking-tight truncate">
                Operaciones en Sucursal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Pakdaar */}
            <button className="relative p-2.5 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-100 focus:outline-none border-none bg-transparent cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Pakaammo ti Encargado */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700 m-0 leading-tight group-hover:text-teal-700 transition-colors">
                  {usuario?.nombre || 'Encargado'}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 m-0 uppercase tracking-wider">
                  Ventas y Atención
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 border border-teal-300 flex items-center justify-center text-teal-800 font-bold text-lg shadow-sm group-hover:shadow-md transition-shadow">
                {(usuario?.nombre || 'E').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Pindutan a Pumanaw */}
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-2 ml-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-xl! transition-all duration-200 border border-slate-200 hover:border-rose-200 shadow-sm hover:shadow focus:outline-none cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Paset ti Vistas (Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="bg-white rounded-2xl! shadow-sm border border-slate-100/50 p-4 sm:p-6 w-full min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}