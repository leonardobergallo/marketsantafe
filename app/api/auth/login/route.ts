// API route para inicio de sesión
// POST /api/auth/login

import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, createSession } from '@/lib/auth'
import { z } from 'zod'
import { cookies } from 'next/headers'

// Schema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Buscar usuario
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar password
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Este usuario no tiene contraseña configurada' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Crear sesión
    await createSession(user.id)

    // Retornar usuario (sin password)
    return NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          is_business: user.is_business,
          business_name: user.business_name,
          avatar_url: user.avatar_url,
          verified: user.verified,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}

