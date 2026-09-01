// Archivo principal de la app: controla el login, la navegación y qué vista se muestra según la pestaña activa.
import React, { useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import MatchDetailModal from './components/MatchDetailModal'
import LoginView from './views/LoginView'
import PartidosView from './views/PartidosView'
import CanchasView from './views/CanchasView'
import ConvocatoriasView from './views/ConvocatoriasView'

export default function App() {
  // NUEVO: Verificamos si existe un token en la memoria. !! lo convierte en true/false
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userRole, setUserRole] = useState('DT')

  const [currentTab, setCurrentTab] = useState('partidos')
  const [selectedDate, setSelectedDate] = useState('2026-09-20')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  // NUEVO: Logout real destruyendo la sesión
  const handleLogout = () => {
    localStorage.removeItem('token') // Borramos el token
    localStorage.removeItem('usuario') // Borramos los datos del usuario
    setIsAuthenticated(false) // Devolvemos al usuario al Login
    setEmail('')
    setPassword('')
    setSelectedMatch(null)
  }

  // Si no está autenticado, mostramos LoginView
  if (!isAuthenticated) {
    return (
      <LoginView 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        userRole={userRole}
        setUserRole={setUserRole}
        onLogin={handleLogin}
      />
    )
  }

  // Si está autenticado, mostramos el sistema
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto border-x border-slate-200 font-sans">
      <Header userRole={userRole} onLogout={handleLogout} />

      <main className="p-4 flex-1 overflow-y-auto space-y-4">
        {currentTab === 'partidos' && (
          <PartidosView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedMatch={setSelectedMatch}
          />
        )}
        {currentTab === 'canchas' && <CanchasView />}
        {currentTab === 'convocatorias' && <ConvocatoriasView />}
      </main>

      <MatchDetailModal 
        match={selectedMatch} 
        selectedDate={selectedDate} 
        onClose={() => setSelectedMatch(null)} 
      />

      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  )
}