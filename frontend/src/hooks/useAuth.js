import { useContext, useRef } from 'react'
import { AuthContext } from '../context/authContext'

export function useAuth() {
  const context = useContext(AuthContext)
  const didLogRef = useRef(false)

  if (!didLogRef.current) {
    console.info('[AUTH] Context initialized')
    didLogRef.current = true
  }

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
