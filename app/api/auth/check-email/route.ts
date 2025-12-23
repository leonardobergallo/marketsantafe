// API route para verificar si un email ya está registrado
// GET /api/auth/check-email?email=xxx

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailSchema = z.string().email()
    const validationResult = emailSchema.safeParse(email)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { exists: false, valid: false },
        { status: 200 }
      )
    }

    // Verificar si el email ya existe
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    return NextResponse.json(
      {
        exists: result.rows.length > 0,
        valid: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verificando email:', error)
    return NextResponse.json(
      { error: 'Error al verificar email' },
      { status: 500 }
    )
  }
}


