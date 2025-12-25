// API route para obtener usuario actual
// GET /api/auth/me

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
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
          is_inmobiliaria_agent: user.is_inmobiliaria_agent || false,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

