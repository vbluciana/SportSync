import React, { useState } from 'react'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginView() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMensaje, setErrorMensaje] = useState('')
  const [exitoMensaje, setExitoMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMensaje('')
    setExitoMensaje('')
    setCargando(true)

    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      })

      const { token, usuario } = response.data
      login(token, usuario)

      setExitoMensaje('¡Bienvenido! Redirigiendo...')
      setTimeout(() => {
        navigate('/partidos')
      }, 1500)

    } catch (error) {
      console.error('Detalle del error en Login:', error)
      setErrorMensaje(error.response?.data?.mensaje || 'Error al conectar al servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
            <img src="/icons/icon-192x192.png" alt="Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SportSync</h1>
        </div>

        {errorMensaje && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {errorMensaje}
          </div>
        )}

        {exitoMensaje && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            {exitoMensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                autoComplete="email"
                disabled={cargando}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                autoComplete="current-password"
                disabled={cargando}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full py-3 bg-[#0288D1] text-white font-bold rounded-xl shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <span>¿No tenés cuenta? </span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-[#0288D1] font-bold hover:underline"
            disabled={cargando}
          >
            Registrarse
          </button>
        </div>
      </div>
    </main>
  )
}