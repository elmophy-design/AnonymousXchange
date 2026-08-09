import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Rates from './pages/Rates/Rates'
import Support from './pages/Support/Support'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Admin from './pages/Admin/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rates" element={<Rates />} />
        <Route path="support" element={<Support />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
