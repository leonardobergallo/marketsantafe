// API para crear una suscripción y generar link de pago
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { pool } from '@/lib/db'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  plan_type: z.enum(['individual-premium', 'properties-premium', 'business-basic', 'business-pro']),
  payment_method: z.enum(['credit_card', 'transfer', 'mercadopago', 'whatsapp']).optional(),
})

const PLAN_PRICES: Record<string, number> = {
  'individual-premium': 4999,
  'properties-premium': 9999,
  'business-basic': 9999,
  'business-pro': 19999,
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createSubscriptionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { plan_type, payment_method = 'mercadopago' } = validationResult.data
    const amount = PLAN_PRICES[plan_type]

    // Calcular fecha de expiración (1 mes desde ahora)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    // Crear suscripción pendiente
    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_type, status, end_date, auto_renew)
       VALUES ($1, $2, 'pending', $3, true)
       RETURNING *`,
      [user.id, plan_type, endDate]
    )

    const subscription = subscriptionResult.rows[0]

    // Crear registro de pago pendiente
    const paymentResult = await pool.query(
      `INSERT INTO payments (user_id, subscription_id, amount, currency, payment_method, payment_status)
       VALUES ($1, $2, $3, 'ARS', $4, 'pending')
       RETURNING *`,
      [user.id, subscription.id, amount, payment_method]
    )

    const payment = paymentResult.rows[0]

    // Si es WhatsApp, retornar info para contacto manual
    if (payment_method === 'whatsapp') {
      const whatsappUrl = `https://wa.me/5493425123456?text=${encodeURIComponent(
        `Hola! Quiero contratar el plan ${plan_type} por $${amount.toLocaleString('es-AR')}/mes. Mi email es ${user.email}`
      )}`
      
      return NextResponse.json({
        subscription: {
          id: subscription.id,
          plan_type: subscription.plan_type,
          amount,
        },
        payment: {
          id: payment.id,
          amount,
          method: payment_method,
        },
        whatsapp_url: whatsappUrl,
        message: 'Contactanos por WhatsApp para completar el pago',
      })
    }

    // Para MercadoPago, redirigir a la API de preferencias
    // Esta ruta ahora está obsoleta, usar /api/payments/create-preference en su lugar
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan_type: subscription.plan_type,
        amount,
      },
      payment: {
        id: payment.id,
        amount,
        method: payment_method,
      },
      message: 'Por favor, usa /api/payments/create-preference para crear el pago con MercadoPago',
      redirect_to: '/api/payments/create-preference',
    })
  } catch (error) {
    console.error('Error creando suscripción:', error)
    return NextResponse.json(
      { error: 'Error al crear la suscripción' },
      { status: 500 }
    )
  }
}

