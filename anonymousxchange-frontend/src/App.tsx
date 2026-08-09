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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rates" element={<Rates />} />
        <Route path="support" element={<Support />} />
        <Route path="account" element={<Account />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
