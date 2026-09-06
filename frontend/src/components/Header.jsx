// Cabecera principal de la app: muestra el logo, el rol activo y las acciones rápidas del usuario.

import React, { useState } from 'react'
import { Bell, LogOut, TriangleAlert, UserRound, X } from 'lucide-react'

export default function Header({ user, userRole, onLogout }) {
  const [showProfile, setShowProfile] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const displayName = user?.nombre || 'Usuario'
  const lastName = user?.apellido || ''

  return (
    <header className="bg-[#076A9F] text-white px-4 py-2.5 sticky top-0 z-20 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <img 
          src="/icons/icon-192x192.png" 
          alt="Logo" 
          className="w-9 h-9 rounded-lg object-contain bg-white p-1 shadow-sm"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-lg tracking-tight leading-none">SportSync</span>
            <span className="text-[9px] bg-white/20 border border-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              {userRole}
            </span>
          </div>
          <p className="text-[10px] text-sky-100 font-medium mt-0.5">Panel deportivo</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button aria-label="Notificaciones" title="Notificaciones" className="p-2 hover:bg-white/10 rounded-lg transition relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span>
        </button>
        <button
          onClick={() => setShowProfile(!showProfile)}
          aria-label="Ver mi perfil"
          title="Mi perfil"
          className={`p-2 rounded-lg transition ${showProfile ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          <UserRound size={18} />
        </button>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          title="Cerrar Sesión" 
          aria-label="Cerrar sesión"
          className="p-2 hover:bg-white/10 rounded-lg transition text-sky-100 hover:text-white"
        >
          <LogOut size={18} />
        </button>
      </div>

      {showProfile && (
        <div className="absolute right-4 top-[calc(100%+0.5rem)] w-64 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-600">Mi perfil</p>
              <h2 className="mt-1 text-sm font-bold">{displayName} {lastName}</h2>
            </div>
            <button onClick={() => setShowProfile(false)} aria-label="Cerrar perfil" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2 pt-3 text-xs text-slate-600">
            <p><span className="font-semibold text-slate-800">Email:</span> {user?.email || 'No disponible'}</p>
            <p><span className="font-semibold text-slate-800">Rol:</span> {userRole}</p>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="presentation">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-slate-800 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                <TriangleAlert size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 id="logout-title" className="font-bold">¿Cerrar sesión?</h2>
                <p className="mt-1 text-sm text-slate-500">¿Estás seguro de que querés salir de SportSync?</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={onLogout}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}