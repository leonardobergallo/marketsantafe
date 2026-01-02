// API route para gestión de propiedades (solo admin)
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
    const active = searchParams.get('active')

    // Construir query
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramCount = 0

    if (search) {
      paramCount++
      whereClause += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (active !== null && active !== undefined && active !== '') {
      paramCount++
      whereClause += ` AND p.active = $${paramCount}`
      params.push(active === 'true')
    }

    // Obtener total
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM properties p
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.count || '0')

    // Obtener propiedades
    paramCount = params.length
    const query = `
      SELECT 
        p.id,
        p.type,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.rooms,
        p.bathrooms,
        p.area_m2,
        p.address,
        p.image_url,
        p.images,
        p.professional_service,
        p.featured,
        p.active,
        p.views,
        p.created_at,
        u.id as user_id,
        u.name as user_name,
        u.business_name,
        z.name as zone_name
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN zones z ON p.zone_id = z.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Parsear imágenes
    const properties = result.rows.map((row: any) => {
      let images: string[] = []
      if (row.images) {
        try {
          images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
        } catch (e) {
          images = []
        }
      }
      if (images.length === 0 && row.image_url) {
        images = [row.image_url]
      }

      return {
        id: row.id.toString(),
        type: row.type,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'ARS',
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
        address: row.address,
        image_url: row.image_url,
        images: images.length > 0 ? images : undefined,
        professional_service: row.professional_service,
        featured: row.featured || false,
        active: row.active,
        views: row.views || 0,
        created_at: row.created_at,
        user_id: row.user_id,
        user_name: row.user_name || row.business_name,
        zone_name: row.zone_name,
      }
    })

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error obteniendo propiedades:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedades' },
      { status: 500 }
    )
  }
}

