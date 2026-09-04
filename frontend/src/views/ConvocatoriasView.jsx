// Vista de convocatorias con confirmación de asistencia para cada partido.
import React from 'react'

export default function ConvocatoriasView() {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <h2 className="font-bold text-slate-800 text-base">Convocatorias Oficiales</h2>
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#076A9F]">Sub-16 Femenino</span>
          <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
            Cierra en 24 hs
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base">Citación vs. Club Municipalidad</h3>
          <p className="text-xs text-slate-500">Sábado 20 de Septiembre • 15:00 hs</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex gap-2">
          <button 
            onClick={() => alert("¡Asistencia confirmada! Estado actualizado en el sistema.")}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm transition"
          >
            Confirmar
          </button>
          <button 
            onClick={() => alert("Ausencia registrada. Se ha notificado al Director Técnico.")}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Ausente
          </button>
        </div>
      </div>
    </div>
  )
}