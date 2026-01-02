// Funciones de autenticación y autorización para administradores
import { getCurrentUser, User } from './auth'
import { NextResponse } from 'next/server'

/**
 * Verifica si el usuario actual es administrador
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.is_admin === true
}

/**
 * Middleware helper para rutas de administración
 * Retorna el usuario si es admin, o null si no lo es
 */
export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  if (!user.is_admin) {
    return null
  }

  return user
}

/**
 * Helper para crear respuesta de error de autorización
 */
export function unauthorizedResponse(message: string = 'No autorizado') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

/**
 * Helper para crear respuesta de error de autenticación
 */
export function unauthenticatedResponse(message: string = 'No autenticado') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

