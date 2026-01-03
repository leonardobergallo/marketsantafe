// Funciones para verificar suscripciones
import { pool } from './db'
import { getPlanLimits, isUnlimited } from './subscription-limits'

export interface SubscriptionInfo {
  plan: string
  status: string
  expiresAt: Date | null
  isActive: boolean
  limits: ReturnType<typeof getPlanLimits>
}

export async function getUserSubscription(userId: number): Promise<SubscriptionInfo | null> {
  try {
    // Obtener suscripción activa más reciente
    const result = await pool.query(
      `SELECT s.plan_type, s.status, s.end_date, u.subscription_plan, u.subscription_expires_at
       FROM subscriptions s
       RIGHT JOIN users u ON u.id = $1
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      // Si no hay suscripción, usar el plan del usuario
      const userResult = await pool.query(
        'SELECT subscription_plan, subscription_expires_at FROM users WHERE id = $1',
        [userId]
      )
      
      if (userResult.rows.length === 0) return null
      
      const plan = userResult.rows[0].subscription_plan || 'free'
      const expiresAt = userResult.rows[0].subscription_expires_at
      const isActive = !expiresAt || new Date(expiresAt) > new Date()
      
      return {
        plan,
        status: isActive ? 'active' : 'expired',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
        limits: getPlanLimits(plan),
      }
    }

    const row = result.rows[0]
    const plan = row.plan_type || row.subscription_plan || 'free'
    const expiresAt = row.end_date || row.subscription_expires_at
    const isActive = row.status === 'active' && (!expiresAt || new Date(expiresAt) > new Date())

    return {
      plan,
      status: row.status,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive,
      limits: getPlanLimits(plan),
    }
  } catch (error) {
    console.error('Error obteniendo suscripción:', error)
    return null
  }
}

export async function checkCanPublish(
  userId: number,
  type: 'listing' | 'property' | 'store_product'
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || !subscription.isActive) {
    return { allowed: false, reason: 'no_active_subscription' }
  }

  const limits = subscription.limits
  let limit: number
  let current: number

  switch (type) {
    case 'listing':
      limit = limits.listings
      if (isUnlimited(limit)) {
        return { allowed: true, current: 0, limit: -1 }
      }
      // Contar publicaciones activas
      const listingsResult = await pool.query(
        'SELECT COUNT(*) as count FROM listings WHERE user_id = $1 AND active = true',
        [userId]
      )
      current = parseInt(listingsResult.rows[0].count) || 0
      break

    case 'property':
      limit = limits.properties
      if (isUnlimited(limit)) {
        return { allowed: true, current: 0, limit: -1 }
      }
      const propertiesResult = await pool.query(
        'SELECT COUNT(*) as count FROM properties WHERE user_id = $1 AND active = true',
        [userId]
      )
      current = parseInt(propertiesResult.rows[0].count) || 0
      break

    case 'store_product':
      limit = limits.store_products
      if (isUnlimited(limit)) {
        return { allowed: true, current: 0, limit: -1 }
      }
      const storeResult = await pool.query(
        `SELECT COUNT(*) as count FROM listings l
         JOIN stores s ON l.store_id = s.id
         WHERE s.user_id = $1 AND l.active = true`,
        [userId]
      )
      current = parseInt(storeResult.rows[0].count) || 0
      break

    default:
      return { allowed: false, reason: 'invalid_type' }
  }

  if (current >= limit) {
    return { allowed: false, reason: 'limit_reached', current, limit }
  }

  return { allowed: true, current, limit }
}





