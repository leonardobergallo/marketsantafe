// API para obtener la suscripción actual del usuario
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription-check'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const subscription = await getUserSubscription(user.id)

    if (!subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        isActive: true,
        limits: {
          listings: 5,
          properties: 3,
          store_products: 10,
          featured: false,
        },
      })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error obteniendo suscripción:', error)
    return NextResponse.json(
      { error: 'Error al obtener la suscripción' },
      { status: 500 }
    )
  }
}





