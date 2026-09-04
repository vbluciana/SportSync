import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, LoaderCircle, Mail, Phone, Search, TriangleAlert } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [feedback, setFeedback] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dni: '', email: '', telefono: '', rol_id: '', categoria: '', password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setFeedback({ type: 'error', message: 'No se pudo cargar el padrón de usuarios.' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      if (isEditing) {
        await api.put(`/users/${editId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setFormData({ nombre: '', apellido: '', dni: '', email: '', telefono: '', rol_id: '', categoria: '', password: '' });
      setIsEditing(false);
      setShowForm(false);
      fetchUsers();
      setFeedback({ type: 'success', message: isEditing ? 'Los cambios se guardaron correctamente.' : 'El nuevo usuario se dio de alta correctamente.' });
      window.setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.mensaje || 'No se pudo guardar el usuario.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm('¿Dar de baja lógica a este usuario?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Error al ejecutar la baja');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          user.dni.includes(search);
    const matchesRole = roleFilter ? user.rol_id.toString() === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Título y Botón de Nuevo Usuario */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Padrón del Club</h1>
          <p className="text-xs text-gray-500">Gestión de integrantes SportSync</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setFormData({ nombre: '', apellido: '', dni: '', email: '', telefono: '', rol_id: '', categoria: '', password: '' }); setShowForm(!showForm); }}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <TriangleAlert size={18} className="mt-0.5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulario desplegable optimizado para móvil */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow-lg rounded-2xl mb-6 border border-gray-100 space-y-3 animate-fadeIn">
          <h2 className="text-sm font-bold text-gray-700 mb-2">{isEditing ? 'Editar Integrante' : 'Dar de Alta Integrante'}</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />
            <input type="text" placeholder="Apellido" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />
          </div>

          <input type="text" placeholder="DNI" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />
          <input type="email" placeholder="Correo Electrónico" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />
          <input type="text" placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />

          {!isEditing && (
            <input type="password" placeholder="Contraseña Inicial" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50" />
          )}

          <select value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 text-gray-700">
            <option value="">Seleccionar Rol</option>
            <option value="1">Coordinador General</option>
            <option value="2">Director Técnico (DT)</option>
            <option value="3">Preparador Físico (PF)</option>
            <option value="4">Jugadora</option>
          </select>

          {/* Criterio de Aceptación: Categoría específica para jugadoras */}
          {String(formData.rol_id) === '4' && (
            <input
              type="text"
              placeholder="Escribir categoría (ej. Sub-16 femenino)"
              value={formData.categoria || ''}
              onChange={e => setFormData({...formData, categoria: e.target.value})}
              required
              className="w-full border border-sky-200 p-2.5 rounded-xl text-sm bg-sky-50 text-sky-900 placeholder:text-sky-400 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          )}

          {saving && (
            <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800" role="status">
              <LoaderCircle size={16} className="animate-spin" />
              Guardando usuario, esperá un momento...
            </div>
          )}

          <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 p-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <LoaderCircle size={17} className="animate-spin" />}
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar Alta'}
          </button>
        </form>
      )}

      {/* Buscador y Filtro superior */}
      <div className="space-y-2 mb-4">
        <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar por nombre o DNI..."
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full border border-gray-200 p-3 pl-10 rounded-xl text-sm bg-white shadow-sm focus:ring-2 focus:ring-sky-500 outline-none" 
        />
          <Search className="absolute left-3 top-3 text-gray-400" size={17} aria-hidden="true" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full border border-gray-200 p-2.5 rounded-xl text-xs bg-white text-gray-600 shadow-sm">
          <option value="">Filtrar por rol: Todos</option>
          <option value="1">Coordinadores</option>
          <option value="2">Directores Técnicos</option>
          <option value="3">Preparadores Físicos</option>
          <option value="4">Jugadoras</option>
        </select>
      </div>

      {/* Lista en formato Cards Mobile (Reemplaza la tabla tradicional) */}
      <div className="space-y-3">
        {loadingUsers && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-10 text-sm font-medium text-slate-500" role="status">
            <LoaderCircle size={20} className="animate-spin text-sky-600" />
            Cargando usuarios...
          </div>
        )}

        {!loadingUsers && filteredUsers.map(user => (
          <div
            key={user.id_usuario}
            onClick={() => setSelectedUserId(selectedUserId === user.id_usuario ? null : user.id_usuario)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 relative cursor-pointer transition hover:border-sky-200 hover:shadow-md"
          >
            <div className="flex items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shadow-inner">
                  {user.nombre[0]}{user.apellido[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{user.nombre} {user.apellido}</h3>
                  <span className="text-xs text-gray-400">DNI: {user.dni}</span>
                </div>
              </div>
            </div>

            {selectedUserId === user.id_usuario && (
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail size={14} className="text-sky-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-sky-600 shrink-0" aria-hidden="true" />
                  <span>{user.telefono || 'Sin teléfono registrado'}</span>
                </div>
                {user.categoria && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 text-center text-sky-600 font-bold" aria-hidden="true">C</span>
                    <span>Categoría: {user.categoria}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${user.estado_activo ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
                  <span>Estado: {user.estado_activo ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center pt-1">
              <div className="flex gap-2">
                  <button onClick={(event) => { event.stopPropagation(); setIsEditing(true); setEditId(user.id_usuario); setFormData(user); setShowForm(true); }} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium active:bg-gray-200">
                  Editar
                </button>
                {user.estado_activo && (
                  <button onClick={(event) => { event.stopPropagation(); handleSoftDelete(user.id_usuario); }} className="text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-medium active:bg-rose-100">
                    Dar de baja
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!loadingUsers && filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
            No se encontraron integrantes en el padrón.
          </div>
        )}
      </div>
    </div>
  );
}