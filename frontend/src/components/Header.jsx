// Cabecera principal de la app: muestra el logo, el rol activo y las acciones rápidas del usuario.

import React from 'react'
import { Bell, LogOut } from 'lucide-react'

export default function Header({ userRole, onLogout }) {
  return (
    <header className="bg-[#0288D1] text-white p-4 sticky top-0 z-20 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img 
          src="/icons/icon-192x192.png" 
          alt="Logo" 
          className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tight leading-none">SportSync</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">
              {userRole}
            </span>
          </div>
          <p className="text-[11px] text-sky-100 font-medium">CEBNAC • Sub-16 Femenino</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="p-2 hover:bg-white/10 rounded-full transition relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
        </button>
        <button 
          onClick={onLogout}
          title="Cerrar Sesión" 
          className="p-2 hover:bg-white/10 rounded-full transition text-sky-200 hover:text-white"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}