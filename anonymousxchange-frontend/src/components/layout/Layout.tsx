import { Outlet } from 'react-router-dom'
import Navbar from './Navbar/Navbar'
import Footer from './Footer/Footer'
import GlobalChatWidget from '../chat/GlobalChatWidget/GlobalChatWidget'
import LiveRatesStrip from '../rates/LiveRatesStrip/LiveRatesStrip'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Navbar />
      <LiveRatesStrip />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <GlobalChatWidget />
    </div>
  )
}
