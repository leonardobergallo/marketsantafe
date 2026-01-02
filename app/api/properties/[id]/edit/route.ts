// API route para obtener una propiedad para editar (verifica que pertenezca al usuario)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      )
    }

    // Obtener propiedad y verificar que pertenece al usuario
    const result = await pool.query(
      `SELECT 
        p.*,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug
       FROM properties p
       LEFT JOIN zones z ON p.zone_id = z.id
       WHERE p.id = $1 AND p.user_id = $2`,
      [propertyId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no tienes permiso para editarla' },
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

    const property = {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      currency: row.currency || 'ARS',
      zone_id: row.zone_id?.toString() || '',
      rooms: row.rooms,
      bathrooms: row.bathrooms,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
      address: row.address,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      images,
      image_url: row.image_url,
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      instagram: row.instagram,
      professional_service: row.professional_service,
    }

    return NextResponse.json({ property }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener propiedad para editar:', error)
    return NextResponse.json(
      { error: 'Error al obtener la propiedad' },
      { status: 500 }
    )
  }
}

