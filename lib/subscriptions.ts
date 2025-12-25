// Funciones helper para gestionar suscripciones

import { query, queryOne } from './db'

export interface SubscriptionPlan {
  id: number
  name: string
  slug: string
  description: string
  price: number
  currency: string
  duration_days: number
  max_listings: number | null
  features: string[]
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface UserSubscription {
  id: number
  user_id: number
  plan_id: number
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  start_date: Date
  end_date: Date
  auto_renew: boolean
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  payment_reference: string | null
  created_at: Date
  updated_at: Date
  plan?: SubscriptionPlan
}

export interface Payment {
  id: number
  subscription_id: number
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  payment_method: string | null
  payment_reference: string | null
  payment_date: Date | null
  due_date: Date
  notes: string | null
  created_at: Date
  updated_at: Date
}

// Obtener todos los planes activos
export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  try {
    const plans = await query<SubscriptionPlan>(
      `SELECT id, name, slug, description, price, currency, duration_days, 
              max_listings, features, is_active, created_at, updated_at
       FROM subscription_plans
       WHERE is_active = true
       ORDER BY price ASC`
    )
    
    return plans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    }))
  } catch (error) {
    console.error('Error obteniendo planes:', error)
    return []
  }
}

// Obtener un plan por slug
export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  try {
    const plan = await queryOne<SubscriptionPlan>(
      `SELECT id, name, slug, description, price, currency, duration_days, 
              max_listings, features, is_active, created_at, updated_at
       FROM subscription_plans
       WHERE slug = $1 AND is_active = true`,
      [slug]
    )
    
    if (!plan) return null
    
    return {
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    }
  } catch (error) {
    console.error('Error obteniendo plan:', error)
    return null
  }
}

// Obtener suscripción activa de un usuario
export async function getActiveSubscription(userId: number): Promise<UserSubscription | null> {
  try {
    const subscription = await queryOne<UserSubscription & { plan_data: string }>(
      `SELECT 
        us.id, us.user_id, us.plan_id, us.status, us.start_date, us.end_date,
        us.auto_renew, us.payment_status, us.payment_method, us.payment_reference,
        us.created_at, us.updated_at,
        sp.id as plan_id_full, sp.name as plan_name, sp.slug as plan_slug,
        sp.description as plan_description, sp.price as plan_price,
        sp.currency as plan_currency, sp.duration_days as plan_duration_days,
        sp.max_listings as plan_max_listings, sp.features as plan_features,
        sp.is_active as plan_is_active, sp.created_at as plan_created_at,
        sp.updated_at as plan_updated_at
       FROM user_subscriptions us
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 
         AND us.status = 'active'
         AND us.end_date > CURRENT_TIMESTAMP
       ORDER BY us.created_at DESC
       LIMIT 1`,
      [userId]
    )
    
    if (!subscription) return null
    
    // Construir objeto plan
    const plan: SubscriptionPlan = {
      id: subscription.plan_id_full,
      name: subscription.plan_name,
      slug: subscription.plan_slug,
      description: subscription.plan_description,
      price: subscription.plan_price,
      currency: subscription.plan_currency,
      duration_days: subscription.plan_duration_days,
      max_listings: subscription.plan_max_listings,
      features: typeof subscription.plan_features === 'string' 
        ? JSON.parse(subscription.plan_features) 
        : subscription.plan_features,
      is_active: subscription.plan_is_active,
      created_at: subscription.plan_created_at,
      updated_at: subscription.plan_updated_at
    }
    
    return {
      id: subscription.id,
      user_id: subscription.user_id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      auto_renew: subscription.auto_renew,
      payment_status: subscription.payment_status,
      payment_method: subscription.payment_method,
      payment_reference: subscription.payment_reference,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
      plan
    }
  } catch (error) {
    console.error('Error obteniendo suscripción activa:', error)
    return null
  }
}

// Verificar si un usuario tiene suscripción activa
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  const subscription = await getActiveSubscription(userId)
  return subscription !== null
}

// Obtener todas las suscripciones de un usuario (historial)
export async function getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
  try {
    const subscriptions = await query<UserSubscription & { plan_data: string }>(
      `SELECT 
        us.id, us.user_id, us.plan_id, us.status, us.start_date, us.end_date,
        us.auto_renew, us.payment_status, us.payment_method, us.payment_reference,
        us.created_at, us.updated_at,
        sp.id as plan_id_full, sp.name as plan_name, sp.slug as plan_slug,
        sp.description as plan_description, sp.price as plan_price,
        sp.currency as plan_currency, sp.duration_days as plan_duration_days,
        sp.max_listings as plan_max_listings, sp.features as plan_features,
        sp.is_active as plan_is_active, sp.created_at as plan_created_at,
        sp.updated_at as plan_updated_at
       FROM user_subscriptions us
       INNER JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1
       ORDER BY us.created_at DESC`,
      [userId]
    )
    
    return subscriptions.map(sub => {
      const plan: SubscriptionPlan = {
        id: sub.plan_id_full,
        name: sub.plan_name,
        slug: sub.plan_slug,
        description: sub.plan_description,
        price: sub.plan_price,
        currency: sub.plan_currency,
        duration_days: sub.plan_duration_days,
        max_listings: sub.plan_max_listings,
        features: typeof sub.plan_features === 'string' 
          ? JSON.parse(sub.plan_features) 
          : sub.plan_features,
        is_active: sub.plan_is_active,
        created_at: sub.plan_created_at,
        updated_at: sub.plan_updated_at
      }
      
      return {
        id: sub.id,
        user_id: sub.user_id,
        plan_id: sub.plan_id,
        status: sub.status,
        start_date: sub.start_date,
        end_date: sub.end_date,
        auto_renew: sub.auto_renew,
        payment_status: sub.payment_status,
        payment_method: sub.payment_method,
        payment_reference: sub.payment_reference,
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        plan
      }
    })
  } catch (error) {
    console.error('Error obteniendo suscripciones del usuario:', error)
    return []
  }
}

// Obtener pagos de una suscripción
export async function getSubscriptionPayments(subscriptionId: number): Promise<Payment[]> {
  try {
    return await query<Payment>(
      `SELECT id, subscription_id, amount, currency, status, payment_method,
              payment_reference, payment_date, due_date, notes, created_at, updated_at
       FROM payments
       WHERE subscription_id = $1
       ORDER BY created_at DESC`,
      [subscriptionId]
    )
  } catch (error) {
    console.error('Error obteniendo pagos:', error)
    return []
  }
}

// Obtener pagos pendientes de un usuario
export async function getPendingPayments(userId: number): Promise<Payment[]> {
  try {
    return await query<Payment>(
      `SELECT p.id, p.subscription_id, p.amount, p.currency, p.status, 
              p.payment_method, p.payment_reference, p.payment_date, p.due_date,
              p.notes, p.created_at, p.updated_at
       FROM payments p
       INNER JOIN user_subscriptions us ON p.subscription_id = us.id
       WHERE us.user_id = $1 
         AND p.status = 'pending'
         AND p.due_date >= CURRENT_DATE
       ORDER BY p.due_date ASC`,
      [userId]
    )
  } catch (error) {
    console.error('Error obteniendo pagos pendientes:', error)
    return []
  }
}

