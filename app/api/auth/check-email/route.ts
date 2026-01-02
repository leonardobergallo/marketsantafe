// API route para verificar si un email ya está registrado
// GET /api/auth/check-email?email=...

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    return NextResponse.json({
      exists: result.rows.length > 0,
    })
  } catch (error) {
    console.error('Error verificando email:', error)
    return NextResponse.json(
      { error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}




