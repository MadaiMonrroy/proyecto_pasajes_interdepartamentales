import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';


import { useAuth } from '../context/AuthContext';


import { 
  Home, 
  KeyRound, 
  Ticket, 
  ShoppingBag, 
  LogOut, 
  BusFront,
  Menu,
  X
} from "lucide-react";

export default function ClienteLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dagiti dalan para iti kliyente
  const navItems = [
    { path: '/cliente', label: 'Inicio', icon: Home },
    { path: '/cliente/comprar', label: 'Comprar Pasaje', icon: ShoppingBag },
    { path: '/cliente/mis-boletos', label: 'Mis Boletos', icon: Ticket },
    { path: '/cambiar-password', label: 'Seguridad', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen  bg-slate-50 font-sans flex flex-col">
      
      {/* Makinsingao a Pagnagnaan (Navbar) */}
      <nav className="bg-gradient-to-r from-teal-900 to-teal-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo ken Titulo */}
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 p-2.5 rounded-xl! backdrop-blur-sm border border-teal-400/30">
                <BusFront size={28} className="text-teal-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-wide m-0 text-white">ViaGo</h1>
                <p className="text-[10px] text-teal-300 uppercase tracking-widest font-semibold m-0">
                  Sistema de Pasajes
                </p>
              </div>
            </div>

            {/* Pagnagnaan para iti Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/cliente' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{ textDecoration: 'none', color: isActive ? '#ffffff' : '#ccfbf1' }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 !no-underline ${
                      isActive 
                        ? 'bg-white/10 !text-white font-semibold backdrop-blur-md border border-white/20 shadow-sm' 
                        : 'hover:bg-white/5 hover:!text-white'
                    }`}
                  >
                    <Icon size={18} color={isActive ? "#ffffff" : "#ccfbf1"} className={isActive ? "" : "opacity-80"} />
                    <span className="m-0 text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Pakaammo ti Agar-aramat ken Pindutan ti Pumanaw */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white m-0 leading-tight">
                    {usuario?.nombre || 'Cliente'}
                  </p>
                  <p className="text-[11px] text-teal-300 m-0">Bienvenido(a)</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-teal-700 border-2 border-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {(usuario?.nombre || 'C').charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Pagsina */}
              <div className="h-8 w-px bg-teal-700/50 hidden sm:block"></div>

              <button
                onClick={cerrarSesion}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-200 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors focus:outline-none border border-transparent hover:border-rose-500/30 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>

              {/* Pindutan para iti Mobile Menu */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-teal-100 hover:bg-teal-800 focus:outline-none cursor-pointer border-none bg-transparent"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Agbaba a Menu para iti Mobile */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100 border-t border-teal-800' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-4 space-y-1 bg-teal-900 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/cliente' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', color: isActive ? '#ffffff' : '#99f6e4' }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl! transition-colors !no-underline ${
                    isActive 
                      ? 'bg-teal-800 !text-white font-semibold' 
                      : 'hover:bg-teal-800/50 hover:!text-white'
                  }`}
                >
                  <Icon size={20} color={isActive ? "#ffffff" : "#99f6e4"} className={isActive ? "" : "opacity-80"} />
                  <span className="m-0 text-base">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                cerrarSesion();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-200 bg-rose-900/30 hover:bg-rose-900/50 rounded-xl! transition-colors focus:outline-none cursor-pointer border border-rose-800/50"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Kangrunaan a Lauk (Outlet) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl! shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-12rem)] w-full relative overflow-hidden">
          
          {/* Arkos iti likudan */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Patingga ti Panid */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 font-medium">
          © {new Date().getFullYear()} TransBolivia - ViaGo. Todos los derechos reservados.
        </div>
      </footer>

    </div>
  );
}