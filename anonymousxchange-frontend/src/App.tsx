import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Rates from './pages/Rates/Rates'
import Support from './pages/Support/Support'
import Account from './pages/Account/Account'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Admin from './pages/Admin/Admin'
import Legal from './pages/Legal/Legal'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rates" element={<Rates />} />
        <Route path="support" element={<Support />} />
        <Route path="privacy" element={<Legal />} />
        <Route path="terms" element={<Legal />} />
        <Route path="security" element={<Legal />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
