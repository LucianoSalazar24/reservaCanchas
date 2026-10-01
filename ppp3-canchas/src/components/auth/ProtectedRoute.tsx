import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context'
import type { Rol } from '@/types'

interface Props {
  children: React.ReactNode
  requiredRole?: Rol
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { sesion } = useAuth()

  if (!sesion) return <Navigate to="/login" replace />
  if (requiredRole && sesion.rol !== requiredRole) return <Navigate to="/forbidden" replace />

  return <>{children}</>
}
