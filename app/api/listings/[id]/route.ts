// API route para obtener un listing por ID
// GET /api/listings/[id]

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT 
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
        u.phone,
        u.name as user_name,
        u.is_business,
        u.business_name
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1 AND l.active = true`,
      [listingId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    const row = result.rows[0]

    // Parsear imágenes
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

    const listing = {
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
      userName: row.user_name,
      isBusiness: row.is_business,
      businessName: row.business_name,
    }

    return NextResponse.json({ listing }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo listing:', error)
    return NextResponse.json(
      { error: 'Error al obtener la publicación' },
      { status: 500 }
    )
  }
}

