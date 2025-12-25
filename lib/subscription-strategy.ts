// Estrategia de suscripciones y conversión
// Lógica para período gratuito, promociones, etc.

import { getActiveSubscription, getPlanBySlug, hasActiveSubscription } from './subscriptions'
import { query, queryOne } from './db'

// Configuración del período promocional
const PROMOTIONAL_PERIOD = {
  enabled: true, // Cambiar a false cuando termine la promoción
  endDate: new Date('2025-06-30'), // Fecha límite del período gratuito
  freePlanSlug: 'gratis-lanzamiento',
  maxFreeUsers: 1000, // Máximo de usuarios que pueden tener plan gratis
}

// Verificar si estamos en período promocional
export function isPromotionalPeriod(): boolean {
  if (!PROMOTIONAL_PERIOD.enabled) return false
  return new Date() < PROMOTIONAL_PERIOD.endDate
}

// Verificar si aún hay cupos para plan gratis
export async function hasFreePlanSlots(): Promise<boolean> {
  try {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM user_subscriptions us
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE sp.slug = $1 AND us.status = 'active'`,
      [PROMOTIONAL_PERIOD.freePlanSlug]
    )
    
    const currentCount = result?.count || 0
    return currentCount < PROMOTIONAL_PERIOD.maxFreeUsers
  } catch (error) {
    console.error('Error verificando cupos:', error)
    return false
  }
}

// Asignar plan gratis automáticamente a un nuevo usuario
export async function assignFreePlanToUser(userId: number): Promise<boolean> {
  try {
    // Verificar si ya tiene suscripción
    const hasActive = await hasActiveSubscription(userId)
    if (hasActive) {
      console.log(`Usuario ${userId} ya tiene suscripción activa`)
      return false
    }

    // Verificar período promocional
    if (!isPromotionalPeriod()) {
      console.log('Período promocional finalizado')
      return false
    }

    // Verificar cupos disponibles
    const hasSlots = await hasFreePlanSlots()
    if (!hasSlots) {
      console.log('No hay cupos disponibles para plan gratis')
      return false
    }

    // Obtener plan gratis
    const freePlan = await getPlanBySlug(PROMOTIONAL_PERIOD.freePlanSlug)
    if (!freePlan) {
      console.error('Plan gratuito no encontrado')
      return false
    }

    // Crear suscripción
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + freePlan.duration_days)

    await query(
      `INSERT INTO user_subscriptions 
       (user_id, plan_id, status, start_date, end_date, auto_renew, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        freePlan.id,
        'active',
        startDate,
        endDate,
        false, // No renovar automáticamente el plan gratis
        'paid' // Considerado como "pagado" porque es gratis
      ]
    )

    console.log(`✅ Plan gratis asignado a usuario ${userId}`)
    return true
  } catch (error) {
    console.error('Error asignando plan gratis:', error)
    return false
  }
}

// Obtener días restantes de suscripción gratuita
export async function getDaysRemainingInFreePlan(userId: number): Promise<number | null> {
  try {
    const subscription = await getActiveSubscription(userId)
    if (!subscription) return null

    const freePlan = await getPlanBySlug(PROMOTIONAL_PERIOD.freePlanSlug)
    if (!freePlan || subscription.plan_id !== freePlan.id) return null

    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  } catch (error) {
    console.error('Error calculando días restantes:', error)
    return null
  }
}

// Verificar si la suscripción está por vencer (últimos 7 días)
export async function isSubscriptionExpiringSoon(userId: number, daysThreshold: number = 7): Promise<boolean> {
  try {
    const subscription = await getActiveSubscription(userId)
    if (!subscription) return false

    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays <= daysThreshold && diffDays > 0
  } catch (error) {
    console.error('Error verificando vencimiento:', error)
    return false
  }
}

// Obtener recomendación de plan según tipo de usuario
export async function getRecommendedPlan(userId: number): Promise<string | null> {
  try {
    // Obtener información del usuario
    const user = await queryOne<{ is_business: boolean; is_inmobiliaria_agent: boolean }>(
      'SELECT is_business, is_inmobiliaria_agent FROM users WHERE id = $1',
      [userId]
    )

    if (!user) return null

    if (user.is_inmobiliaria_agent) {
      return 'agente-inmobiliario'
    } else if (user.is_business) {
      return 'bar-restaurante'
    } else {
      return 'particular'
    }
  } catch (error) {
    console.error('Error obteniendo plan recomendado:', error)
    return null
  }
}

// Obtener estadísticas de conversión
export async function getConversionStats() {
  try {
    const stats = await queryOne<{
      total_free: number
      total_paid: number
      conversion_rate: number
      free_expiring_soon: number
    }>(
      `SELECT 
        (SELECT COUNT(*) FROM user_subscriptions us
         INNER JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE sp.slug = 'gratis-lanzamiento' AND us.status = 'active') as total_free,
        (SELECT COUNT(*) FROM user_subscriptions us
         INNER JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE sp.slug != 'gratis-lanzamiento' AND us.status = 'active') as total_paid,
        (SELECT COUNT(*) FROM user_subscriptions us
         INNER JOIN subscription_plans sp ON us.plan_id = sp.id
         WHERE sp.slug = 'gratis-lanzamiento' 
           AND us.status = 'active'
           AND us.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as free_expiring_soon
      `
    )

    const total = (stats?.total_free || 0) + (stats?.total_paid || 0)
    const conversionRate = total > 0 
      ? ((stats?.total_paid || 0) / total) * 100 
      : 0

    return {
      totalFree: stats?.total_free || 0,
      totalPaid: stats?.total_paid || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      freeExpiringSoon: stats?.free_expiring_soon || 0
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return {
      totalFree: 0,
      totalPaid: 0,
      conversionRate: 0,
      freeExpiringSoon: 0
    }
  }
}

