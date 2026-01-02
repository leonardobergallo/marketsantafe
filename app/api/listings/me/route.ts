// API route para obtener mis productos individuales (sin tienda)
// GET /api/listings/me

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.currency,
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
        z.slug as zone_slug
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      WHERE l.user_id = $1 AND (l.store_id IS NULL OR l.store_id = 0)
      ORDER BY l.created_at DESC`,
      [user.id]
    )

    const listings = result.rows.map((row: any) => {
      // Parsear imágenes
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
        description: row.description || '',
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'ARS',
        condition: row.condition || 'usado',
        imageUrl: row.image_url || images[0] || '/placeholder.jpg',
        images: images.length > 0 ? images : undefined,
        featured: row.featured || false,
        active: row.active,
        views: row.views || 0,
        createdAt: row.created_at.toISOString(),
        category: {
          id: row.category_id?.toString() || '',
          name: row.category_name,
          slug: row.category_slug,
        },
        zone: {
          id: row.zone_id?.toString() || '',
          name: row.zone_name,
          slug: row.zone_slug,
        },
      }
    })

    return NextResponse.json({ listings }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener productos individuales:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    )
  }
}

