// API route para obtener información del plan gratuito del usuario
// GET /api/subscriptions/free-plan-info

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getDaysRemainingInFreePlan, isSubscriptionExpiringSoon } from '@/lib/subscription-strategy'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const daysRemaining = await getDaysRemainingInFreePlan(user.id)
    const expiringSoon = daysRemaining !== null 
      ? await isSubscriptionExpiringSoon(user.id, 7)
      : false

    return NextResponse.json({
      daysRemaining,
      expiringSoon,
      hasFreePlan: daysRemaining !== null
    })
  } catch (error) {
    console.error('Error obteniendo info del plan gratuito:', error)
    return NextResponse.json(
      { error: 'Error al obtener información' },
      { status: 500 }
    )
  }
}

