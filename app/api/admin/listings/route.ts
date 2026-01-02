// API route para gestión de productos/listings (solo admin)
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
      whereClause += ` AND (l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (active !== null && active !== undefined && active !== '') {
      paramCount++
      whereClause += ` AND l.active = $${paramCount}`
      params.push(active === 'true')
    }

    // Obtener total
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM listings l
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.count || '0')

    // Obtener listings
    paramCount = params.length
    const query = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.image_url,
        l.images,
        l.featured,
        l.active,
        l.views,
        l.created_at,
        u.id as user_id,
        u.name as user_name,
        u.business_name,
        c.name as category_name,
        z.name as zone_name,
        s.name as store_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      LEFT JOIN stores s ON l.store_id = s.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // Parsear imágenes
    const listings = result.rows.map((row: any) => {
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
        title: row.title,
        description: row.description,
        price: parseFloat(row.price) || 0,
        condition: row.condition,
        image_url: row.image_url,
        images: images.length > 0 ? images : undefined,
        featured: row.featured || false,
        active: row.active,
        views: row.views || 0,
        created_at: row.created_at,
        user_id: row.user_id,
        user_name: row.user_name || row.business_name,
        category_name: row.category_name,
        zone_name: row.zone_name,
        store_name: row.store_name,
      }
    })

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

