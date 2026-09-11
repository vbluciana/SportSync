import React, { useState } from 'react'
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const InputField = ({ label, name, type, icon: Icon, error, value, onChange, onBlur, disabled, ...props }) => (
  <div className="relative">
    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-3 text-slate-400" size={18} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-200 focus:border-[#0288D1] focus:ring-[#0288D1]/20'
        }`}
        disabled={disabled}
        {...props}
      />
      {error && (
        <span className="absolute right-3 top-3 text-red-400" title={error}>
          <AlertCircle size={18} />
        </span>
      )}
      {!error && value && (
        <span className="absolute right-3 top-3 text-green-400">
          <CheckCircle size={18} />
        </span>
      )}
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
)

export default function RegisterView() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errorMensaje, setErrorMensaje] = useState('')
  const [exitoMensaje, setExitoMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [erroresCampo, setErroresCampo] = useState({})

  const validarCampo = (name, value) => {
    let error = ''
    switch (name) {
      case 'nombre':
        if (!value.trim()) error = 'El nombre es obligatorio'
        break
      case 'apellido':
        if (!value.trim()) error = 'El apellido es obligatorio'
        break
      case 'dni':
        if (!value.trim()) error = 'El DNI es obligatorio'
        else if (!/^\d{7,8}$/.test(value.replace(/\./g, ''))) error = 'DNI inválido (7-8 dígitos)'
        break
      case 'email':
        if (!value.trim()) error = 'El email es obligatorio'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Formato de email inválido'
        break
      case 'password':
        if (!value) error = 'La contraseña es obligatoria'
        else if (value.length < 8) error = 'Mínimo 8 caracteres'
        else if (!/[A-Z]/.test(value)) error = 'Debe contener mayúscula'
        else if (!/[a-z]/.test(value)) error = 'Debe contener minúscula'
        else if (!/[0-9]/.test(value)) error = 'Debe contener número'
        break
      case 'confirmPassword':
        if (!value) error = 'Confirme la contraseña'
        else if (value !== formData.password) error = 'Las contraseñas no coinciden'
        break
      case 'telefono':
        if (value && !/^[\d\s\-\(\)\+]{8,}$/.test(value)) error = 'Teléfono inválido'
        break
      default:
        break
    }
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value }
    setFormData(newFormData)

    const error = validarCampo(name, value)
    setErroresCampo(prev => ({ ...prev, [name]: error }))

    if (name === 'password') {
      const confirmError = validarCampo('confirmPassword', newFormData.confirmPassword)
      setErroresCampo(prev => ({ ...prev, confirmPassword: confirmError }))
    }

    if (errorMensaje) setErrorMensaje('')
    if (exitoMensaje) setExitoMensaje('')
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validarCampo(name, value)
    setErroresCampo(prev => ({ ...prev, [name]: error }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    let esValido = true

    Object.keys(formData).forEach(key => {
      const error = validarCampo(key, formData[key])
      if (error) {
        nuevosErrores[key] = error
        esValido = false
      }
    })

    setErroresCampo(nuevosErrores)
    return esValido
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMensaje('')
    setExitoMensaje('')

    if (!validarFormulario()) {
      setErrorMensaje('Por favor complete todos los campos correctamente')
      return
    }

    setCargando(true)

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim().replace(/\./g, ''),
        telefono: formData.telefono.trim() || null,
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      }

      const response = await api.post('/auth/register', payload)

      setExitoMensaje('¡Registro exitoso! Redirigiendo al login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (error) {
      console.error('Error en registro:', error)
      if (error.response?.status === 409) {
        setErrorMensaje(error.response.data.mensaje || 'El Email o DNI ya se encuentra registrado')
      } else if (error.response?.status === 400) {
        setErrorMensaje(error.response.data.mensaje || 'Datos inválidos. Verifique los campos.')
      } else if (error.response?.status === 500) {
        setErrorMensaje('Error del servidor. Intente nuevamente más tarde.')
      } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        setErrorMensaje('Error de conexión. Verifique su internet e intente nuevamente.')
      } else {
        setErrorMensaje('Error inesperado. Intente nuevamente.')
      }
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
          <p className="text-xs text-slate-500 mt-1">Auto-registro de Jugadores</p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <InputField
            label="Nombre"
            name="nombre"
            type="text"
            icon={User}
            error={erroresCampo.nombre}
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            autoComplete="given-name"
            autoFocus
          />

          <InputField
            label="Apellido"
            name="apellido"
            type="text"
            icon={User}
            error={erroresCampo.apellido}
            value={formData.apellido}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            autoComplete="family-name"
          />

          <InputField
            label="DNI"
            name="dni"
            type="text"
            icon={User}
            error={erroresCampo.dni}
            value={formData.dni}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            inputMode="numeric"
            placeholder="Sin puntos ni guiones"
          />

          <InputField
            label="Teléfono (opcional)"
            name="telefono"
            type="tel"
            icon={Phone}
            error={erroresCampo.telefono}
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            placeholder="Ej: 351 123 4567"
            autoComplete="tel"
          />

          <InputField
            label="Correo"
            name="email"
            type="email"
            icon={Mail}
            error={erroresCampo.email}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            autoComplete="email"
          />

          <InputField
            label="Contraseña"
            name="password"
            type="password"
            icon={Lock}
            error={erroresCampo.password}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            autoComplete="new-password"
          />

          <InputField
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            icon={Lock}
            error={erroresCampo.confirmPassword}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={cargando}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#0288D1] text-white font-bold rounded-xl shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Registrando...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <span>¿Ya tenés cuenta? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[#0288D1] font-bold hover:underline"
            disabled={cargando}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </main>
  )
}