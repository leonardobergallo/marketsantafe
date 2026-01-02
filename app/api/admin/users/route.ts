// API route para gestión de usuarios (solo admin)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-admin'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''

    // Construir query con búsqueda opcional
    let whereClause = ''
    const params: any[] = []
    let paramCount = 0

    if (search) {
      paramCount++
      whereClause = `WHERE (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR business_name ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    // Obtener total de usuarios
    const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.count || '0')

    // Obtener usuarios con paginación
    paramCount = params.length
    const query = `
      SELECT 
        id, name, email, phone, whatsapp, is_business, business_name, 
        avatar_url, verified, is_admin, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    params.push(limit, offset)

    const result = await pool.query(query, params)

    const users = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      is_business: row.is_business,
      business_name: row.business_name,
      avatar_url: row.avatar_url,
      verified: row.verified,
      is_admin: row.is_admin || false,
      created_at: row.created_at,
    }))

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

