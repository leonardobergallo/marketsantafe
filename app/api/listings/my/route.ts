// API route para obtener los listings del usuario actual
// GET /api/listings/my

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para ver tus publicaciones' },
        { status: 401 }
      )
    }

    // Obtener listings del usuario
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
        l.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug,
        l.whatsapp,
        l.phone,
        l.email,
        l.instagram
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC`,
      [user.id]
    )

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
        active: row.active || false,
        views: row.views || 0,
        currency: row.currency || 'ARS',
      }
    })

    return NextResponse.json({
      listings,
      total: listings.length,
    })
  } catch (error) {
    console.error('Error al obtener listings del usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener tus publicaciones' },
      { status: 500 }
    )
  }
}



