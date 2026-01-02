// API route para obtener un listing por ID
// GET /api/listings/[id]

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para eliminar un producto' },
        { status: 401 }
      )
    }

    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    // Verificar que el producto pertenece al usuario
    const checkResult = await pool.query(
      'SELECT id, user_id FROM listings WHERE id = $1',
      [listingId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este producto' },
        { status: 403 }
      )
    }

    // Eliminar producto
    await pool.query('DELETE FROM listings WHERE id = $1', [listingId])

    return NextResponse.json(
      { message: 'Producto eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para actualizar un producto' },
        { status: 401 }
      )
    }

    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    // Verificar que el producto pertenece al usuario
    const checkResult = await pool.query(
      'SELECT id, user_id FROM listings WHERE id = $1',
      [listingId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar este producto' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { z } = await import('zod')

    const updateListingSchema = z.object({
      title: z.string().min(1).optional(),
      categoryId: z.string().optional(),
      zoneId: z.string().optional(),
      price: z.string().optional(),
      currency: z.enum(['ARS', 'USD']).optional(),
      condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional().nullable(),
      description: z.string().min(1).optional(),
      whatsapp: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      email: z.string().email().optional().or(z.literal('')).nullable(),
      instagram: z.string().optional().nullable(),
      images: z.array(z.string()).optional(),
    })

    const data = updateListingSchema.parse(body)

    // Buscar categoría si se proporciona
    let categoryId: number | null = null
    if (data.categoryId) {
      const categoryQuery = /^\d+$/.test(data.categoryId)
        ? 'SELECT id FROM categories WHERE id = $1'
        : 'SELECT id FROM categories WHERE slug = $1 LIMIT 1'
      const categoryResult = await pool.query(categoryQuery, [data.categoryId])
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id
      }
    } else {
      // Mantener la categoría actual si no se proporciona
      const currentResult = await pool.query('SELECT category_id FROM listings WHERE id = $1', [listingId])
      categoryId = currentResult.rows[0]?.category_id || null
    }

    // Buscar zona si se proporciona
    let zoneId: number | null = null
    if (data.zoneId) {
      const zoneQuery = /^\d+$/.test(data.zoneId)
        ? 'SELECT id FROM zones WHERE id = $1'
        : 'SELECT id FROM zones WHERE slug = $1 LIMIT 1'
      const zoneResult = await pool.query(zoneQuery, [data.zoneId])
      if (zoneResult.rows.length > 0) {
        zoneId = zoneResult.rows[0].id
      }
    } else {
      // Mantener la zona actual si no se proporciona
      const currentResult = await pool.query('SELECT zone_id FROM listings WHERE id = $1', [listingId])
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

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(data.title.trim())
    }
    if (categoryId !== null) {
      updates.push(`category_id = $${paramCount++}`)
      values.push(categoryId)
    }
    if (zoneId !== null) {
      updates.push(`zone_id = $${paramCount++}`)
      values.push(zoneId)
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramCount++}`)
      values.push(parseFloat(data.price))
    }
    if (data.currency !== undefined) {
      updates.push(`currency = $${paramCount++}`)
      values.push(data.currency)
    }
    if (data.condition !== undefined) {
      updates.push(`condition = $${paramCount++}`)
      values.push(data.condition)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description.trim())
    }
    if (data.whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramCount++}`)
      values.push(data.whatsapp && data.whatsapp !== '' ? data.whatsapp.trim() : null)
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`)
      values.push(data.phone && data.phone !== '' ? data.phone.trim() : null)
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

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updates.length === 1) {
      // Solo updated_at, no hay cambios reales
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      )
    }

    values.push(listingId)
    const query = `UPDATE listings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`

    const result = await pool.query(query, values)
    const listing = result.rows[0]

    return NextResponse.json({ listing }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

