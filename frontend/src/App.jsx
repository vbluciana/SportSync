// Archivo principal de la app: controla el login, la navegación y qué vista se muestra según la pestaña activa.
import React, { useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import MatchDetailModal from './components/MatchDetailModal'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import PartidosView from './views/PartidosView'
import CanchasView from './views/CanchasView'
import ConvocatoriasView from './views/ConvocatoriasView'
import UserManagement from './pages/userManagement'

const storedUser = JSON.parse(localStorage.getItem('usuario') || 'null')

export default function App() {
  // NUEVO: Verificamos si existe un token en la memoria. !! lo convierte en true/false
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [userRole, setUserRole] = useState(storedUser?.rol || 'DT')
  const [currentUser, setCurrentUser] = useState(storedUser)

  const [currentTab, setCurrentTab] = useState('partidos')
  const [selectedDate, setSelectedDate] = useState('2026-09-20')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const handleLogin = (user) => {
    setShowRegister(false)
    setCurrentUser(user)
    setUserRole(user.rol)
    setIsAuthenticated(true)
  }

  // NUEVO: Logout real destruyendo la sesión
  const handleLogout = () => {
    localStorage.removeItem('token') // Borramos el token
    localStorage.removeItem('usuario') // Borramos los datos del usuario
    setCurrentUser(null)
    setIsAuthenticated(false) // Devolvemos al usuario al Login
    setEmail('')
    setPassword('')
    setSelectedMatch(null)
  }

  // Si no está autenticado, mostramos LoginView
  if (!isAuthenticated) {
    if (showRegister) return <RegisterView onBack={() => setShowRegister(false)} />

    return (
      <LoginView 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }

  // Si está autenticado, mostramos el sistema
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto border-x border-slate-200 font-sans">
      <Header user={currentUser} userRole={userRole} onLogout={handleLogout} />

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
        {currentTab === 'usuarios' && userRole === 'COORDINADOR' && <UserManagement />}
      </main>

      <MatchDetailModal 
        match={selectedMatch} 
        selectedDate={selectedDate} 
        onClose={() => setSelectedMatch(null)} 
      />

      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} userRole={userRole} />
    </div>
  )
}