// Archivo principal de la app: controla el login, la navegación y qué vista se muestra según la pestaña activa.
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import MatchDetailModal from './components/MatchDetailModal'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import PartidosView from './views/PartidosView'
import CanchasView from './views/CanchasView'
import ConvocatoriasView from './views/ConvocatoriasView'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/partidos" replace />
}

function AppContent() {
  const { user, logout } = useAuth()
  const [currentTab, setCurrentTab] = useState('partidos')
  const [selectedDate, setSelectedDate] = useState('2026-09-20')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const userRole = user?.rol || '';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto border-x border-slate-200 font-sans">
      <Header userRole={userRole} onLogout={logout} />

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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginView />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterView />
              </PublicRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}