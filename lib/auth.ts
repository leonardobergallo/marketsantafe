// Helper de autenticación
// Funciones para manejar sesiones, passwords, etc.

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { queryOne } from './db'

export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  is_business: boolean
  business_name: string | null
  avatar_url: string | null
  verified: boolean
  created_at: Date
  updated_at: Date
}

// Hash de password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verificar password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Obtener usuario actual desde la sesión
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return null
    }

    const user = await queryOne<User>(
      `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [parseInt(userId)]
    )

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Crear sesión
export async function createSession(userId: number): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}

// Destruir sesión
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}

// Tipo con password (solo para uso interno)
interface UserWithPassword extends User {
  password_hash: string | null
}

// Obtener usuario por email (con password para verificación)
export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  return queryOne<UserWithPassword>(
    `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified, created_at, updated_at, password_hash 
     FROM users 
     WHERE email = $1`,
    [email]
  )
}

// Obtener usuario por ID
export async function getUserById(id: number): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified, created_at, updated_at 
     FROM users 
     WHERE id = $1`,
    [id]
  )
}

