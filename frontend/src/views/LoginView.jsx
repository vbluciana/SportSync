// Pantalla de inicio de sesión para entrar al sistema según el rol del usuario.
import React from 'react'
import { Mail, Lock } from 'lucide-react'

export default function LoginView({
  email,
  setEmail,
  password,
  setPassword,
  userRole,
  setUserRole,
  onLogin
}) {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Renderizado del Logo del Club */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/icons/icon-192x192.png" 
              alt="Logo SportSync" 
              className="w-full h-full object-contain rounded-2xl shadow-md"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SportSync</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            Vóley CEBNAC
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@cebnac.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ingresar como:
            </label>
            <select 
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0288D1]"
            >
              <option value="DT">Director Técnico (DT)</option>
              <option value="JUGADORA">Jugadora</option>
              <option value="COORDINADOR">Coordinador General</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-[#0288D1] hover:bg-[#01579B] active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition duration-150 text-sm mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-5">
          Presiona el botón para entrar y probar la interfaz
        </p>
      </div>
    </main>
  )
}