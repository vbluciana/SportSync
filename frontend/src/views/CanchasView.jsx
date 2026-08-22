// Vista de ocupación de canchas para ver disponibilidad y turnos del predio.
import React from 'react'

export default function CanchasView() {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-base">Ocupación de Canchas</h2>
          <p className="text-xs text-slate-500">5 Canchas • Tiempo Real</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En Vivo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Cancha {n}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              Cubierta / Techada
            </span>
            <p className="text-xs font-bold text-emerald-600">Libre</p>
          </div>
        ))}
        {[4, 5].map((n) => (
          <div key={n} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Cancha {n}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              Al Aire Libre
            </span>
            <p className="text-xs font-bold text-amber-600">Turno 18:30 hs</p>
          </div>
        ))}
      </div>
    </div>
  )
}