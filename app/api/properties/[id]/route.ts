// API route para obtener una propiedad pública por ID
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      )
    }

    // Obtener propiedad
    const result = await pool.query(
      `SELECT 
        p.*,
        z.name as zone_name,
        z.slug as zone_slug,
        u.name as user_name,
        u.phone as user_phone,
        u.whatsapp as user_whatsapp,
        u.email as user_email
       FROM properties p
       LEFT JOIN zones z ON p.zone_id = z.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.active = true`,
      [propertyId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
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
    if (images.length === 0 && row.image_url) {
      images = [row.image_url]
    }

    // Incrementar vistas
    await pool.query(
      'UPDATE properties SET views = views + 1 WHERE id = $1',
      [propertyId]
    )

    const property = {
      id: row.id.toString(),
      type: row.type,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      currency: row.currency || 'ARS',
      rooms: row.rooms,
      bathrooms: row.bathrooms,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
      address: row.address,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      images,
      image_url: row.image_url,
      phone: row.phone || row.user_phone,
      whatsapp: row.whatsapp || row.user_whatsapp,
      email: row.email || row.user_email,
      instagram: row.instagram,
      professional_service: row.professional_service,
      featured: row.featured,
      views: (row.views || 0) + 1,
      created_at: row.created_at,
      zone_name: row.zone_name,
      zone_slug: row.zone_slug,
      user_name: row.user_name,
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error al obtener propiedad:', error)
    return NextResponse.json(
      { error: 'Error al obtener la propiedad' },
      { status: 500 }
    )
  }
}

