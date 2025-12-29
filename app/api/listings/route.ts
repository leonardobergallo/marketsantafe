// API route para obtener listings del mercado
// GET /api/listings

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const q = searchParams.get('q') || undefined
    const category = searchParams.get('cat') || undefined
    const zone = searchParams.get('zone') || undefined
    const min = searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined
    const max = searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined
    const condition = searchParams.get('cond') || undefined
    const store_id = searchParams.get('store_id') ? parseInt(searchParams.get('store_id')!) : undefined

    // Construir query
    let query = `
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
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug,
        u.whatsapp,
        u.phone
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.active = true
    `
    
    const params: any[] = []
    let paramCount = 0

    // Filtro por búsqueda de texto
    if (q) {
      paramCount++
      query += ` AND (l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`
      params.push(`%${q}%`)
    }

    // Filtro por categoría
    if (category) {
      paramCount++
      query += ` AND c.slug = $${paramCount}`
      params.push(category)
    }

    // Filtro por zona
    if (zone) {
      paramCount++
      query += ` AND z.slug = $${paramCount}`
      params.push(zone)
    }

    // Filtro por precio mínimo
    if (min !== undefined) {
      paramCount++
      query += ` AND l.price >= $${paramCount}`
      params.push(min)
    }

    // Filtro por precio máximo
    if (max !== undefined) {
      paramCount++
      query += ` AND l.price <= $${paramCount}`
      params.push(max)
    }

    // Filtro por condición
    if (condition) {
      paramCount++
      query += ` AND l.condition = $${paramCount}`
      params.push(condition)
    }

    // Filtro por tienda
    if (store_id !== undefined) {
      paramCount++
      query += ` AND l.store_id = $${paramCount}`
      params.push(store_id)
    }

    // Ordenar por featured primero, luego por fecha
    query += ` ORDER BY l.featured DESC, l.created_at DESC`

    const result = await pool.query(query, params)

    // Transformar resultados
    const listings = result.rows.map((row: any) => {
      // Parsear imágenes si es JSON
      let images: string[] = []
      if (row.images) {
        try {
          images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
        } catch (e) {
          images = []
        }
      }
      
      // Si no hay imágenes pero hay image_url, usar image_url
      if (images.length === 0 && row.image_url) {
        images = [row.image_url]
      }

      return {
        id: row.id.toString(),
        title: row.title,
        price: parseFloat(row.price) || 0,
        categoryId: row.category_id?.toString() || '',
        zoneId: row.zone_id?.toString() || '',
        condition: row.condition || 'usado',
        description: row.description || '',
        imageUrl: row.image_url || images[0] || '/placeholder.jpg',
        images: images.length > 0 ? images : undefined,
        createdAt: row.created_at.toISOString(),
        whatsapp: row.whatsapp || undefined,
        phone: row.phone || undefined,
        featured: row.featured || false,
        // Datos adicionales
        category: row.category_name,
        zone: row.zone_name,
      }
    })

    return NextResponse.json({ listings }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo listings:', error)
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    )
  }
}

