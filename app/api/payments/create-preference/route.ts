// API para crear una preferencia de pago en MercadoPago
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { pool } from '@/lib/db'
import { z } from 'zod'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const createPreferenceSchema = z.object({
  plan_type: z.enum(['individual-premium', 'properties-premium', 'business-basic', 'business-pro']),
})

const PLAN_PRICES: Record<string, number> = {
  'individual-premium': 4999,
  'properties-premium': 9999,
  'business-basic': 9999,
  'business-pro': 19999,
}

const PLAN_NAMES: Record<string, string> = {
  'individual-premium': 'Individual Premium',
  'properties-premium': 'Propiedades Premium',
  'business-basic': 'Negocio Básico',
  'business-pro': 'Negocio Pro',
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createPreferenceSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { plan_type } = validationResult.data
    const amount = PLAN_PRICES[plan_type]
    const planName = PLAN_NAMES[plan_type]

    // Verificar que MercadoPago esté configurado
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: 'MercadoPago no está configurado. Contacta al administrador.' },
        { status: 500 }
      )
    }

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
       VALUES ($1, $2, $3, 'ARS', 'mercadopago', 'pending')
       RETURNING *`,
      [user.id, subscription.id, amount, 'mercadopago']
    )

    const payment = paymentResult.rows[0]

    // Inicializar MercadoPago
    const client = new MercadoPagoConfig({ 
      accessToken: accessToken,
      options: { timeout: 5000 }
    })
    const preference = new Preference(client)

    // Crear preferencia de pago
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const preferenceData = {
      items: [
        {
          title: `Plan ${planName} - MarketSantaFe`,
          description: `Suscripción mensual al plan ${planName}`,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: user.name || 'Usuario',
        email: user.email,
      },
      back_urls: {
        success: `${baseUrl}/pago/exito?payment_id=${payment.id}`,
        failure: `${baseUrl}/pago/error?payment_id=${payment.id}`,
        pending: `${baseUrl}/pago/pendiente?payment_id=${payment.id}`,
      },
      auto_return: 'approved',
      external_reference: `subscription_${subscription.id}_payment_${payment.id}`,
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: 'MarketSantaFe',
      metadata: {
        user_id: user.id.toString(),
        subscription_id: subscription.id.toString(),
        payment_id: payment.id.toString(),
        plan_type: plan_type,
      },
    }

    const preferenceResponse = await preference.create({ body: preferenceData })

    // Actualizar el pago con el ID de la preferencia
    await pool.query(
      `UPDATE payments SET payment_provider_id = $1 WHERE id = $2`,
      [preferenceResponse.id, payment.id]
    )

    return NextResponse.json({
      preference_id: preferenceResponse.id,
      init_point: preferenceResponse.init_point,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
      subscription: {
        id: subscription.id,
        plan_type: subscription.plan_type,
        amount,
      },
      payment: {
        id: payment.id,
        amount,
      },
    })
  } catch (error: any) {
    console.error('Error creando preferencia de pago:', error)
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago', details: error.message },
      { status: 500 }
    )
  }
}

