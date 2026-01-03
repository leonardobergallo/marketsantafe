// API para verificar el estado de un pago
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago requerido' }, { status: 400 })
    }

    // Obtener información del pago
    const result = await pool.query(
      `SELECT p.*, s.plan_type, s.status as subscription_status
       FROM payments p
       JOIN subscriptions s ON p.subscription_id = s.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [paymentId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    const payment = result.rows[0]

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        payment_status: payment.payment_status,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
      },
      subscription: {
        id: payment.subscription_id,
        plan_type: payment.plan_type,
        status: payment.subscription_status,
      },
    })
  } catch (error: any) {
    console.error('Error verificando estado del pago:', error)
    return NextResponse.json(
      { error: 'Error al verificar el estado del pago' },
      { status: 500 }
    )
  }
}





