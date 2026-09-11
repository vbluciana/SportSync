import React, { useState } from 'react'
import { X } from 'lucide-react'
import api from '../services/api'

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ field, label, value, error, onChange, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold">{label}<input {...props} value={value} onChange={onChange} className={`mt-1 w-full rounded-xl border bg-slate-50 p-2.5 text-sm ${error ? 'border-rose-400' : 'border-slate-200'}`} /></label>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

export default function ProfileModal({ user, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    dni: user?.dni || '',
    email: user?.email || '',
    telefono: user?.telefono || ''
  })
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  const updateField = (field, value) => {
    setFormData(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
    setFeedback(null)
  }

  const validate = () => {
    const nextErrors = {}
    if (!namePattern.test(formData.nombre.trim())) nextErrors.nombre = 'Ingresá un nombre válido de 2 a 40 letras.'
    if (!namePattern.test(formData.apellido.trim())) nextErrors.apellido = 'Ingresá un apellido válido de 2 a 40 letras.'
    if (!/^\d{7,8}$/.test(formData.dni)) nextErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos.'
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = 'Ingresá un correo electrónico válido.'
    if (!/^\d{10,}$/.test(formData.telefono.trim())) nextErrors.telefono = 'El teléfono debe tener al menos 10 dígitos.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback(null)
    if (!validate()) {
      setFeedback({ type: 'error', message: 'Revisá los campos marcados antes de continuar.' })
      return
    }

    setSaving(true)
    try {
      const response = await api.put('/users/me/profile', {
        ...formData,
        email: formData.email.trim().toLowerCase()
      })
      setFeedback({ type: 'success', message: 'El perfil se guardó exitosamente.' })
      window.setTimeout(() => onUpdated({ ...response.data.usuario, rol: user.rol }), 1200)
    } catch (requestError) {
      setFeedback({ type: 'error', message: requestError.response?.data?.mensaje || 'No se pudo actualizar el perfil' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" role="presentation">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 text-slate-800 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id="profile-title" className="text-lg font-bold">Editar perfil</h2>
          <button onClick={onClose} aria-label="Cerrar edición de perfil" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {feedback && <p className={`mt-3 rounded-xl border p-3 text-xs font-semibold ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="status">{feedback.message}</p>}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
          <Field field="nombre" label="Nombre" value={formData.nombre} error={errors.nombre} onChange={event => updateField('nombre', event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))} />
          <Field field="apellido" label="Apellido" value={formData.apellido} error={errors.apellido} onChange={event => updateField('apellido', event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''))} />
          <Field field="dni" label="DNI" value={formData.dni} error={errors.dni} inputMode="numeric" maxLength={8} onChange={event => updateField('dni', event.target.value.replace(/\D/g, ''))} />
          <Field field="email" label="Correo electrónico" value={formData.email} error={errors.email} type="email" onChange={event => updateField('email', event.target.value.toLowerCase())} />
          <Field field="telefono" label="Teléfono" value={formData.telefono} error={errors.telefono} inputMode="numeric" onChange={event => updateField('telefono', event.target.value.replace(/\D/g, ''))} />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#076A9F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}