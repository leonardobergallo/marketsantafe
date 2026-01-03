// Helper de autenticación multi-tenant
import { getCurrentUser, User } from './auth'
import { NextResponse } from 'next/server'
import { queryOne } from './db'

export type UserRole = 'market_admin' | 'tenant_admin' | 'tenant_agent' | 'user'

export interface UserWithRole extends User {
  tenant_id?: number | null
  role?: UserRole
}

// Obtener usuario actual con role y tenant_id
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const userWithRole = await queryOne<UserWithRole>(
      `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified, is_admin, 
              tenant_id, role, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [user.id]
    )

    return userWithRole
  } catch (error) {
    console.error('Error getting current user with role:', error)
    return null
  }
}

// Verificar si es market admin
export async function isMarketAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole()
  return user?.role === 'market_admin' || user?.is_admin === true
}

// Verificar si es tenant admin o agent
export async function isTenantUser(): Promise<boolean> {
  const user = await getCurrentUserWithRole()
  return user?.role === 'tenant_admin' || user?.role === 'tenant_agent'
}

// Requerir market admin
export async function requireMarketAdmin(): Promise<UserWithRole | null> {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  if (user.role !== 'market_admin' && user.is_admin !== true) return null
  return user
}

// Requerir tenant user (admin o agent)
export async function requireTenantUser(): Promise<UserWithRole | null> {
  const user = await getCurrentUserWithRole()
  if (!user) return null
  if (!user.tenant_id) return null
  if (user.role !== 'tenant_admin' && user.role !== 'tenant_agent') return null
  return user
}

// Verificar acceso a tenant específico
export async function canAccessTenant(tenantId: number): Promise<boolean> {
  const user = await getCurrentUserWithRole()
  if (!user) return false
  // Market admin puede acceder a todos
  if (user.role === 'market_admin' || user.is_admin === true) return true
  // Tenant user solo puede acceder a su tenant
  return user.tenant_id === tenantId
}

export function unauthorizedResponse(message: string = 'No autorizado') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function unauthenticatedResponse(message: string = 'No autenticado') {
  return NextResponse.json({ error: message }, { status: 401 })
}


