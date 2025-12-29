// API route para obtener mis propiedades
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
      `SELECT p.*, z.name as zone_name, z.slug as zone_slug
       FROM properties p
       LEFT JOIN zones z ON p.zone_id = z.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [user.id]
    )

    const properties = result.rows.map((row: any) => {
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
        id: row.id,
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
        image_url: row.image_url,
        images,
        phone: row.phone,
        whatsapp: row.whatsapp,
        email: row.email,
        instagram: row.instagram,
        professional_service: row.professional_service,
        professional_service_requested_at: row.professional_service_requested_at,
        featured: row.featured,
        active: row.active,
        views: row.views,
        created_at: row.created_at,
        zone_name: row.zone_name,
        zone_slug: row.zone_slug,
      }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error al obtener propiedades:', error)
    return NextResponse.json(
      { error: 'Error al obtener las propiedades' },
      { status: 500 }
    )
  }
}

