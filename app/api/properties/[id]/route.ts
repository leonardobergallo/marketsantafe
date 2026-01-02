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

// DELETE - Eliminar propiedad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para eliminar una propiedad' },
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

    // Verificar que la propiedad pertenece al usuario
    const checkResult = await pool.query(
      'SELECT id, user_id FROM properties WHERE id = $1',
      [propertyId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta propiedad' },
        { status: 403 }
      )
    }

    // Eliminar propiedad
    await pool.query('DELETE FROM properties WHERE id = $1', [propertyId])

    return NextResponse.json(
      { message: 'Propiedad eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar propiedad:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la propiedad' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar propiedad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para actualizar una propiedad' },
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

    // Verificar que la propiedad pertenece al usuario
    const checkResult = await pool.query(
      'SELECT id, user_id FROM properties WHERE id = $1',
      [propertyId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar esta propiedad' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { z } = await import('zod')

    const updatePropertySchema = z.object({
      type: z.enum(['alquiler', 'venta', 'alquiler-temporal']).optional(),
      title: z.string().min(5).max(200).optional(),
      description: z.string().min(10).max(2000).optional(),
      price: z.string().optional(),
      currency: z.enum(['ARS', 'USD']).optional(),
      zone_id: z.string().optional(),
      rooms: z.string().optional().or(z.literal('')).nullable(),
      bathrooms: z.string().optional().or(z.literal('')).nullable(),
      area_m2: z.string().optional().or(z.literal('')).nullable(),
      address: z.string().max(500).optional().or(z.literal('')).nullable(),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      phone: z.string().optional().nullable(),
      whatsapp: z.string().optional().nullable(),
      email: z.string().email().optional().or(z.literal('')).nullable(),
      instagram: z.string().optional().nullable(),
      images: z.array(z.string()).optional(),
      professional_service: z.boolean().optional(),
    })

    const data = updatePropertySchema.parse(body)

    // Buscar zona si se proporciona
    let zoneId: number | null = null
    if (data.zone_id) {
      const zoneQuery = /^\d+$/.test(data.zone_id)
        ? 'SELECT id FROM zones WHERE id = $1'
        : 'SELECT id FROM zones WHERE slug = $1 LIMIT 1'
      const zoneResult = await pool.query(zoneQuery, [data.zone_id])
      if (zoneResult.rows.length > 0) {
        zoneId = zoneResult.rows[0].id
      }
    } else {
      // Mantener la zona actual si no se proporciona
      const currentResult = await pool.query('SELECT zone_id FROM properties WHERE id = $1', [propertyId])
      zoneId = currentResult.rows[0]?.zone_id || null
    }

    // Procesar imágenes
    const imagesArray = data.images || []
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null
    const imagesJson = imagesArray.length > 0 ? JSON.stringify(imagesArray) : null

    // Construir query de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.type !== undefined) {
      updates.push(`type = $${paramCount++}`)
      values.push(data.type)
    }
    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(data.title.trim())
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description.trim())
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramCount++}`)
      values.push(parseFloat(data.price))
    }
    if (data.currency !== undefined) {
      updates.push(`currency = $${paramCount++}`)
      values.push(data.currency)
    }
    if (zoneId !== null) {
      updates.push(`zone_id = $${paramCount++}`)
      values.push(zoneId)
    }
    if (data.rooms !== undefined) {
      updates.push(`rooms = $${paramCount++}`)
      values.push(data.rooms && data.rooms !== '' ? parseInt(data.rooms) : null)
    }
    if (data.bathrooms !== undefined) {
      updates.push(`bathrooms = $${paramCount++}`)
      values.push(data.bathrooms && data.bathrooms !== '' ? parseInt(data.bathrooms) : null)
    }
    if (data.area_m2 !== undefined) {
      updates.push(`area_m2 = $${paramCount++}`)
      values.push(data.area_m2 && data.area_m2 !== '' ? parseFloat(data.area_m2) : null)
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramCount++}`)
      values.push(data.address && data.address !== '' ? data.address.trim() : null)
    }
    if (data.latitude !== undefined) {
      updates.push(`latitude = $${paramCount++}`)
      values.push(data.latitude)
    }
    if (data.longitude !== undefined) {
      updates.push(`longitude = $${paramCount++}`)
      values.push(data.longitude)
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`)
      values.push(data.phone && data.phone !== '' ? data.phone.trim() : null)
    }
    if (data.whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramCount++}`)
      values.push(data.whatsapp && data.whatsapp !== '' ? data.whatsapp.trim() : null)
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`)
      values.push(data.email && data.email !== '' ? data.email.trim() : null)
    }
    if (data.instagram !== undefined) {
      updates.push(`instagram = $${paramCount++}`)
      values.push(data.instagram && data.instagram !== '' ? data.instagram.trim() : null)
    }
    if (data.images !== undefined) {
      updates.push(`image_url = $${paramCount++}`)
      values.push(primaryImage)
      updates.push(`images = $${paramCount++}`)
      values.push(imagesJson)
    }
    if (data.professional_service !== undefined) {
      updates.push(`professional_service = $${paramCount++}`)
      values.push(data.professional_service)
      if (data.professional_service) {
        updates.push(`professional_service_requested_at = $${paramCount++}`)
        values.push(new Date())
      }
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updates.length === 1) {
      // Solo updated_at, no hay cambios reales
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    values.push(propertyId)
    const query = `UPDATE properties SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(query, values)
    const property = result.rows[0]

    return NextResponse.json({ property }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar propiedad:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar la propiedad' },
      { status: 500 }
    )
  }
}

