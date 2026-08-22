// Vista del calendario de partidos y detalle de cada fecha del fixture del equipo.
import React from 'react'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { INITIAL_MATCHES } from '../data/initialMatches'

export default function PartidosView({ selectedDate, setSelectedDate, setSelectedMatch }) {
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)
  const startOffset = Array.from({ length: 1 }, (_, i) => i)

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Septiembre 2026</h2>
            <p className="text-xs text-slate-500">Fixture Oficial FCV</p>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition">
              <ChevronLeft size={18} />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span className="text-[#0288D1]">S</span>
          <span className="text-[#0288D1]">D</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {startOffset.map((_, index) => (
            <div key={`offset-${index}`} className="h-10"></div>
          ))}

          {daysInMonth.map((day) => {
            const dateKey = `2026-09-${day < 10 ? '0' + day : day}`
            const hasMatch = Boolean(INITIAL_MATCHES[dateKey])
            const isSelected = selectedDate === dateKey

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDate(dateKey)
                  if (hasMatch) {
                    setSelectedMatch(INITIAL_MATCHES[dateKey][0])
                  } else {
                    setSelectedMatch(null)
                  }
                }}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition font-medium text-xs ${
                  isSelected
                    ? 'bg-[#0288D1] text-white font-bold shadow-md shadow-sky-500/30 scale-105 z-10'
                    : hasMatch
                    ? 'bg-sky-50 text-[#0288D1] font-bold border border-sky-200 hover:bg-sky-100'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{day}</span>
                {hasMatch && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : 'bg-[#0288D1]'
                  }`}></span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0288D1]"></span> Con Partido FCV
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Sin Encuentros
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-800 text-sm">
            Partidos para el {selectedDate}
          </h3>
          <span className="text-xs text-slate-500">
            {INITIAL_MATCHES[selectedDate] ? '1 Encuentro' : '0 Encuentros'}
          </span>
        </div>

        {INITIAL_MATCHES[selectedDate] ? (
          INITIAL_MATCHES[selectedDate].map((partido) => (
            <div 
              key={partido.id}
              onClick={() => setSelectedMatch(partido)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0288D1] transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  partido.condicion === 'LOCAL' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {partido.condicion}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Clock size={14} /> {partido.hora}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#0288D1] uppercase tracking-wider">
                  {partido.categoria}
                </span>
                <h4 className="font-bold text-slate-900 text-base">
                  CEBNAC vs. {partido.rival}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" />
                  {partido.cancha}
                </span>
                <span className="text-[#0288D1] font-bold hover:underline">
                  Ver detalle →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
            <CalendarIcon className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm font-semibold">No hay partidos oficiales en esta fecha</p>
            <p className="text-xs text-slate-400 mt-0.5">Selecciona un día marcado en celeste en el calendario</p>
          </div>
        )}
      </div>
    </div>
  )
}