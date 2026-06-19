import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import {
  changePassword as changePasswordRequest,
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from '../api/auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('store_rating_token'))
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function hydrateUser() {
      console.info('[AUTH] Restoring session', { hasToken: Boolean(token) })

      if (!token) {
        setIsReady(true)
        return
      }

      try {
        const response = await fetchCurrentUser()
        if (!isMounted) {
          return
        }

        console.info('[AUTH] Session restored', {
          userId: response.data?.data?.user?.id,
          role: response.data?.data?.user?.role,
        })
        setUser(response.data.data.user)
      } catch (error) {
        localStorage.removeItem('store_rating_token')
        console.warn('[AUTH] Session restore failed', {
          message: error.response?.data?.message || error.message,
        })
        if (isMounted) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsReady(true)
        }
      }
    }

    hydrateUser()

    return () => {
      isMounted = false
    }
  }, [token])

  async function handleLogin(payload) {
    const response = await loginRequest(payload)
    const authData = response.data?.data

    if (!authData?.token || !authData?.user) {
      throw new Error('Invalid login response structure')
    }

    const { token: nextToken, user: nextUser } = authData

    console.info('[AUTH] Setting user + token', {
      userId: nextUser?.id,
      role: nextUser?.role,
    })
    localStorage.setItem('store_rating_token', nextToken)
    setToken(nextToken)
    setUser(nextUser)
    return nextUser
  }

  async function handleSignup(payload) {
    const response = await signupRequest(payload)
    const authData = response.data?.data

    if (!authData?.token || !authData?.user) {
      throw new Error('Invalid signup response structure')
    }

    const { token: nextToken, user: nextUser } = authData

    console.info('[AUTH] Setting user + token', {
      userId: nextUser?.id,
      role: nextUser?.role,
    })
    localStorage.setItem('store_rating_token', nextToken)
    setToken(nextToken)
    setUser(nextUser)
    return nextUser
  }

  async function handleLogout() {
    try {
      await logoutRequest()
    } catch (error) {
      // Stateless logout for this phase, so frontend cleanup still proceeds.
    } finally {
      console.info('[AUTH] Clearing session')
      localStorage.removeItem('store_rating_token')
      setToken(null)
      setUser(null)
    }
  }

  async function handleChangePassword(payload) {
    const response = await changePasswordRequest(payload)
    return response.data?.data
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isReady,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      changePassword: handleChangePassword,
    }),
    [isReady, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
