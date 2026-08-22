// Modal de detalle del partido: muestra información, ubicación y datos de cada encuentro.
import React from 'react'
import { X, MapPin, ExternalLink } from 'lucide-react'

export default function MatchDetailModal({ match, selectedDate, onClose }) {
  if (!match) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            match.condicion === 'LOCAL' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-indigo-100 text-indigo-800'
          }`}>
            {match.condicion === 'LOCAL' ? 'Encuentro Local' : 'Encuentro Visitante'}
          </span>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <span className="text-xs font-bold text-[#0288D1] uppercase">
            {match.categoria}
          </span>
          <h3 className="text-lg font-black text-slate-900 leading-tight">
            CEBNAC vs. {match.rival}
          </h3>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Fecha y Hora:</span>
            <span className="font-bold text-slate-800">{selectedDate} • {match.hora}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Sede / Cancha:</span>
            <span className="font-bold text-slate-800">{match.cancha}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Dirección:</span>
            <span className="font-bold text-slate-800">{match.direccion}</span>
          </div>
        </div>

        {match.gpsUrl && (
          <a
            href={match.gpsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-indigo-200"
          >
            <MapPin size={16} /> Abrir Ubicación en Google Maps <ExternalLink size={14} />
          </a>
        )}

        <button 
          onClick={onClose}
          className="w-full py-3 bg-[#0288D1] text-white font-bold rounded-xl text-xs shadow-md transition"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}