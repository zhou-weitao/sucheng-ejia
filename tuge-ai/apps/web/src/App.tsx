import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import ImageStudio from './pages/ImageStudio'
import Account from './pages/Account'
import DashboardLayout from './components/DashboardLayout'

interface User {
  id: string
  email: string
  username: string
  role: string
  status: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/account', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route element={<DashboardLayout user={user} setUser={setUser} />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/tasks" element={<Tasks user={user} />} />
          <Route path="/image-studio" element={<ImageStudio user={user} />} />
          <Route path="/account" element={<Account user={user} />} />
        </Route>

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
