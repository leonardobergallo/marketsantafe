// API route para registro de usuarios
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  whatsapp: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  is_business: z.boolean().default(false),
  business_name: z.string().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Limpiar campos vacíos
    if (body.phone === '' || body.phone === null) body.phone = undefined
    if (body.whatsapp === '' || body.whatsapp === null) body.whatsapp = undefined
    if (body.business_name === '' || body.business_name === null) body.business_name = undefined

    // Validar datos
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('Error de validación:', validationResult.error.errors)
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const { name, email, password, phone, whatsapp, is_business, business_name } =
      validationResult.data

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }

    // Hash del password
    const passwordHash = await hashPassword(password)

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, whatsapp, is_business, business_name, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified, created_at`,
      [
        name,
        email,
        passwordHash,
        phone || null,
        whatsapp || null,
        is_business,
        business_name || null,
        false, // verified por defecto false
      ]
    )

    const user = result.rows[0]

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
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
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}

