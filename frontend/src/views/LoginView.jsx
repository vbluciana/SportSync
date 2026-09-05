import React, { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import api from '../services/api' // NUEVO: Importamos nuestro cartero

export default function LoginView({
  email, setEmail, password, setPassword, userRole, setUserRole, onLogin
}) {
  const [errorMensaje, setErrorMensaje] = useState(''); // Estado para guardar errores
  const [cargando, setCargando] = useState(false); // Para el spinner del botón

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página recargue
    setErrorMensaje('');
    setCargando(true);

    try {
      // 1. Enviamos los datos al backend usando axios (api)
      const response = await api.post('/auth/login', { 
        email: email, 
        password: password 
      });

      // 2. Si es exitoso, guardamos el token y datos en la memoria del celular
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      // 3. Avisamos a la app que ya entramos
      onLogin(response.data.usuario);

    } catch (error) {
      // 4. Si falla, capturamos el mensaje del backend y lo mostramos
      console.error('Detalle del error en Login:', error);
      setErrorMensaje(error.response?.data?.mensaje || 'Error al conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
            <img src="/icons/logo-login.png" alt="Logo de SportSync" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SportSync</h1>
        </div>

        {/* NUEVO: Cartel rojo de error si fallan las credenciales */}
        {errorMensaje && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
            {errorMensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4"> {/* Cambiado a handleSubmit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full py-3 bg-[#076A9F] text-white font-bold rounded-xl shadow-lg mt-2"
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}