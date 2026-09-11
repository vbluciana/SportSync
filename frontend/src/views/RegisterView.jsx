import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, UserRound } from 'lucide-react';
import api from '../services/api';

const initialForm = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  password: ''
};

const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterView({ onBack }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    const filters = {
      nombre: /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
      apellido: /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
      dni: /\D/g,
      telefono: /\D/g
    };
    const filteredValue = filters[field] ? value.replace(filters[field], '') : value;
    setFormData(current => ({ ...current, [field]: filteredValue }));
    setErrors(current => ({ ...current, [field]: '' }));
    setFeedback(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!namePattern.test(formData.nombre.trim())) nextErrors.nombre = 'Ingresá un nombre válido de 2 a 40 letras.';
    if (!namePattern.test(formData.apellido.trim())) nextErrors.apellido = 'Ingresá un apellido válido de 2 a 40 letras.';
    if (!/^\d{7,8}$/.test(formData.dni)) nextErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos.';
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = 'Ingresá un correo electrónico válido.';
    if (!/^\d{10,}$/.test(formData.telefono.trim())) nextErrors.telefono = 'El teléfono debe tener al menos 10 dígitos.';
    if (formData.password.length < 6) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setFeedback(null);
    if (!validate()) {
      setFeedback({ type: 'error', message: 'Revisá los campos marcados antes de continuar.' });
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/auth/register', {
        ...formData,
        email: formData.email.trim().toLowerCase()
      });
      setFormData(initialForm);
      setErrors({});
      setFeedback({ type: 'success', message: response.data.mensaje });
      window.setTimeout(onBack, 1800);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.mensaje || 'No se pudo crear la cuenta.'
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = field => `w-full border p-2.5 rounded-xl text-sm bg-slate-50 ${errors[field] ? 'border-rose-400' : 'border-slate-200'}`;

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-700">
          <ArrowLeft size={17} /> Volver al inicio de sesión
        </button>

        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <img src="/icons/logo-login.png" alt="Logo de SportSync" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Crear cuenta</h1>
        </div>

        {feedback && (
          <div className={`mb-4 rounded-xl border p-3 text-xs font-semibold ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="status">
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nombre" icon={<UserRound size={17} />} value={formData.nombre} error={errors.nombre} onChange={value => updateField('nombre', value)} className={inputClass('nombre')} />
            <Field label="Apellido" value={formData.apellido} error={errors.apellido} onChange={value => updateField('apellido', value)} className={inputClass('apellido')} />
          </div>
          <Field label="DNI" value={formData.dni} error={errors.dni} onChange={value => updateField('dni', value)} inputMode="numeric" maxLength={8} className={inputClass('dni')} />
          <Field label="Correo electrónico" icon={<Mail size={17} />} value={formData.email} error={errors.email} onChange={value => updateField('email', value.toLowerCase())} type="email" className={inputClass('email')} />
          <Field label="Teléfono" value={formData.telefono} error={errors.telefono} onChange={value => updateField('telefono', value)} inputMode="numeric" required className={inputClass('telefono')} />
          <Field label="Contraseña" icon={<Lock size={17} />} value={formData.password} error={errors.password} onChange={value => updateField('password', value)} type="password" className={inputClass('password')} />

          <button type="submit" disabled={saving} className="w-full py-3 bg-[#076A9F] text-white font-bold rounded-xl shadow-lg disabled:opacity-60">
            {saving ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, icon, value, error, onChange, className, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase text-slate-700">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-3 text-slate-400">{icon}</span>}
        <input {...props} value={value} onChange={event => onChange(event.target.value)} className={`${className} ${icon ? 'pl-10' : ''}`} />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
