// API route para obtener propiedades de una inmobiliaria por slug
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por business_name que coincida con el slug
    // Obtener todos los usuarios inmobiliarias y filtrar en JavaScript
    const userResult = await pool.query(
      `SELECT id, name, email, phone, whatsapp, is_business, business_name, avatar_url, verified
       FROM users
       WHERE is_business = true
       AND business_name IS NOT NULL`,
      []
    )

    // Filtrar en JavaScript para comparar slugs generados
    const matchingUser = userResult.rows.find((u: any) => {
      if (!u.business_name) return false
      const userSlug = generateSlug(u.business_name)
      return userSlug === slug
    })

    if (!matchingUser) {
      return NextResponse.json(
        { error: 'Inmobiliaria no encontrada' },
        { status: 404 }
      )
    }

    const user = matchingUser

    // Obtener propiedades activas de esta inmobiliaria
    const propertiesResult = await pool.query(
      `SELECT 
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
        p.latitude,
        p.longitude,
        p.image_url,
        p.images,
        p.professional_service,
        p.featured,
        p.active,
        p.views,
        p.created_at,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug
      FROM properties p
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE p.user_id = $1 AND p.active = true
      ORDER BY p.created_at DESC`,
      [user.id]
    )

    // Parsear imágenes
    const properties = propertiesResult.rows.map((row: any) => {
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
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
        image_url: row.image_url,
        images: images.length > 0 ? images : undefined,
        professional_service: row.professional_service,
        featured: row.featured || false,
        views: row.views || 0,
        created_at: row.created_at,
        zone_id: row.zone_id?.toString() || '',
        zone_name: row.zone_name,
        zone_slug: row.zone_slug,
      }
    })

    return NextResponse.json({
      inmobiliaria: {
        id: user.id,
        name: user.name,
        business_name: user.business_name,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp,
        avatar_url: user.avatar_url,
        verified: user.verified,
        slug: generateSlug(user.business_name || ''),
      },
      properties,
    })
  } catch (error) {
    console.error('Error obteniendo propiedades de inmobiliaria:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedades' },
      { status: 500 }
    )
  }
}
