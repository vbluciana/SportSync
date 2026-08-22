// Navegación inferior móvil para cambiar entre las secciones principales del sistema.
import React from 'react'
import { Calendar as CalendarIcon, Grid, Users } from 'lucide-react'

export default function BottomNav({ currentTab, setCurrentTab }) {
  return (
    <nav className="bg-white border-t border-slate-200 flex justify-around p-2 sticky bottom-0 z-20 shadow-lg">
      <button
        onClick={() => setCurrentTab('partidos')}
        className={`flex flex-col items-center py-1.5 px-4 rounded-xl text-xs font-bold transition ${
          currentTab === 'partidos' 
            ? 'text-[#0288D1] bg-sky-50' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <CalendarIcon size={20} />
        <span className="mt-1 text-[11px]">Partidos</span>
      </button>
      
      <button
        onClick={() => setCurrentTab('canchas')}
        className={`flex flex-col items-center py-1.5 px-4 rounded-xl text-xs font-bold transition ${
          currentTab === 'canchas' 
            ? 'text-[#0288D1] bg-sky-50' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Grid size={20} />
        <span className="mt-1 text-[11px]">Canchas</span>
      </button>

      <button
        onClick={() => setCurrentTab('convocatorias')}
        className={`flex flex-col items-center py-1.5 px-4 rounded-xl text-xs font-bold transition ${
          currentTab === 'convocatorias' 
            ? 'text-[#0288D1] bg-sky-50' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Users size={20} />
        <span className="mt-1 text-[11px]">Plantel</span>
      </button>
    </nav>
  )
}