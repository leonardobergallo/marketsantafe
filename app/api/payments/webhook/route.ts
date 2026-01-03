// Webhook de MercadoPago para recibir notificaciones de pago
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id

      // Verificar que MercadoPago esté configurado
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
      if (!accessToken) {
        console.error('MercadoPago no está configurado')
        return NextResponse.json({ error: 'Configuración faltante' }, { status: 500 })
      }

      // Obtener información del pago desde MercadoPago
      const client = new MercadoPagoConfig({ accessToken })
      const payment = new Payment(client)
      
      const paymentInfo = await payment.get({ id: paymentId })

      // Buscar el pago en nuestra base de datos usando external_reference o metadata
      const externalRef = paymentInfo.external_reference || ''
      const metadata = paymentInfo.metadata || {}
      
      let paymentRecord: any = null

      if (externalRef.startsWith('subscription_')) {
        // Extraer IDs del external_reference: subscription_{id}_payment_{id}
        const match = externalRef.match(/subscription_(\d+)_payment_(\d+)/)
        if (match) {
          const [, subscriptionId, paymentIdFromRef] = match
          const result = await pool.query(
            `SELECT * FROM payments WHERE id = $1 AND subscription_id = $2`,
            [paymentIdFromRef, subscriptionId]
          )
          paymentRecord = result.rows[0]
        }
      } else if (metadata.payment_id) {
        const result = await pool.query(
          `SELECT * FROM payments WHERE id = $1`,
          [metadata.payment_id]
        )
        paymentRecord = result.rows[0]
      }

      if (!paymentRecord) {
        console.error('Pago no encontrado en la base de datos:', externalRef, metadata)
        return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
      }

      // Actualizar estado del pago
      const paymentStatus = paymentInfo.status
      let dbStatus = 'pending'
      
      if (paymentStatus === 'approved') {
        dbStatus = 'completed'
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        dbStatus = 'failed'
      } else if (paymentStatus === 'refunded') {
        dbStatus = 'refunded'
      }

      // Actualizar el pago
      await pool.query(
        `UPDATE payments 
         SET payment_status = $1, 
             payment_date = $2,
             payment_provider_id = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [dbStatus, paymentInfo.date_approved || new Date(), paymentId.toString(), paymentRecord.id]
      )

      // Si el pago fue aprobado, activar la suscripción
      if (dbStatus === 'completed') {
        await pool.query(
          `UPDATE subscriptions 
           SET status = 'active', 
               start_date = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [paymentRecord.subscription_id]
        )

        // Actualizar el plan del usuario
        const subscriptionResult = await pool.query(
          `SELECT plan_type FROM subscriptions WHERE id = $1`,
          [paymentRecord.subscription_id]
        )
        
        if (subscriptionResult.rows[0]) {
          const planType = subscriptionResult.rows[0].plan_type
          await pool.query(
            `UPDATE users 
             SET subscription_plan = $1,
                 subscription_expires_at = (SELECT end_date FROM subscriptions WHERE id = $2)
             WHERE id = $3`,
            [planType, paymentRecord.subscription_id, paymentRecord.user_id]
          )
        }
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook', details: error.message },
      { status: 500 }
    )
  }
}

// GET para verificación de webhook (MercadoPago puede hacer GET requests)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}





