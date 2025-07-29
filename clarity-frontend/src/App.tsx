import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import TimerPage from './pages/TimerPage'
import JournalPage from './pages/JournalPage'
import ResetToolsPage from './pages/ResetToolsPage'
import Navbar from './components/Navbar'
import { Toaster } from 'sonner'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat" 
          element={user ? <ChatPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/timer" 
          element={user ? <TimerPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/journal" 
          element={user ? <JournalPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reset-tools" 
          element={user ? <ResetToolsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
