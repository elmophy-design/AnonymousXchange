import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setCredentials, logout } from '../../store/slices/authSlice'
import { authApi } from '../../api/auth'

export default function SessionBootstrap() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      if (!accessToken || !refreshToken || isAuthenticated) {
        return
      }

      try {
        const { data } = await authApi.refresh(refreshToken)
        const payload = data?.data ?? data
        if (!payload?.accessToken) {
          throw new Error('No access token returned')
        }

        dispatch(
          setCredentials({
            user: payload.user ?? { id: 'unknown' },
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
          })
        )
      } catch {
        dispatch(logout())
        if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) {
          navigate('/login', { replace: true })
        }
      }
    }

    void restoreSession()
  }, [dispatch, isAuthenticated, location.pathname, navigate])

  return null
}
