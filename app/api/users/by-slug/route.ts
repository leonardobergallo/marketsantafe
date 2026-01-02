// API route para obtener usuario por slug (business_name)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por business_name que coincida con el slug
    const result = await pool.query(
      `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified
       FROM users
       WHERE is_business = true
       AND LOWER(REPLACE(REPLACE(REPLACE(business_name, ' ', '-'), 'á', 'a'), 'é', 'e')) = LOWER($1)
       OR LOWER(business_name) LIKE LOWER($2)`,
      [slug, `%${slug.replace(/-/g, ' ')}%`]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error obteniendo usuario por slug:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}



