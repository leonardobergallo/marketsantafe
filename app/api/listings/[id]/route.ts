// API route para obtener, actualizar o eliminar un listing
// GET /api/listings/[id] - Obtener listing
// PUT /api/listings/[id] - Actualizar listing
// DELETE /api/listings/[id] - Eliminar listing

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación para actualizar
const updateListingSchema = z.object({
  title: z.string().min(1, 'El título es requerido').optional(),
  categoryId: z.string().min(1, 'La categoría es requerida').optional(),
  zoneId: z.string().min(1, 'La zona es requerida').optional(),
  price: z.union([z.string(), z.number()]).optional(),
  currency: z.enum(['ARS', 'USD']).optional(),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional().nullable(),
  description: z.string().min(1, 'La descripción es requerida').optional(),
  whatsapp: z.string().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  instagram: z.string().optional().or(z.literal('')).nullable(),
  images: z.array(z.string()).optional(),
  imageUrl: z.string().optional().or(z.literal('')).nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = await pool.query(
      `SELECT * FROM listings WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener listing:', error)
    return NextResponse.json(
      { error: 'Error al obtener la publicación' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para editar' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validar datos
    const validationResult = updateListingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Verificar que el listing existe y pertenece al usuario
    const existingListing = await pool.query(
      `SELECT user_id FROM listings WHERE id = $1`,
      [id]
    )

    if (existingListing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    if (existingListing.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta publicación' },
        { status: 403 }
      )
    }

    const data = validationResult.data

    // Construir la query de actualización dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(data.title)
    }

    if (data.categoryId !== undefined) {
      const categoryIdNum = parseInt(data.categoryId)
      if (!isNaN(categoryIdNum)) {
        updates.push(`category_id = $${paramIndex++}`)
        values.push(categoryIdNum)
      }
    }

    if (data.zoneId !== undefined) {
      const zoneIdNum = parseInt(data.zoneId)
      if (!isNaN(zoneIdNum)) {
        updates.push(`zone_id = $${paramIndex++}`)
        values.push(zoneIdNum)
      }
    }

    if (data.price !== undefined) {
      const priceNum = typeof data.price === 'number' ? data.price : parseFloat(String(data.price))
      updates.push(`price = $${paramIndex++}`)
      values.push(isNaN(priceNum) ? 0 : priceNum)
    }

    if (data.currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`)
      values.push(data.currency)
    }

    if (data.condition !== undefined) {
      updates.push(`condition = $${paramIndex++}`)
      values.push(data.condition)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(data.description)
    }

    if (data.whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramIndex++}`)
      values.push(data.whatsapp && data.whatsapp.trim() !== '' ? data.whatsapp : null)
    }

    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`)
      values.push(data.phone && data.phone.trim() !== '' ? data.phone : null)
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(data.email && data.email.trim() !== '' ? data.email : null)
    }

    if (data.instagram !== undefined) {
      updates.push(`instagram = $${paramIndex++}`)
      values.push(data.instagram && data.instagram.trim() !== '' ? data.instagram : null)
    }

    if (data.images !== undefined) {
      const imagesArray = data.images.filter((img: string) => img && img.trim() !== '')
      const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null
      
      updates.push(`images = $${paramIndex++}`)
      values.push(JSON.stringify(imagesArray))
      
      updates.push(`image_url = $${paramIndex++}`)
      values.push(primaryImage)
    } else if (data.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex++}`)
      values.push(data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : null)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    // Agregar el ID al final para el WHERE
    values.push(id)

    const query = `
      UPDATE listings 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, title, updated_at
    `

    const result = await pool.query(query, values)

    return NextResponse.json({
      message: 'Publicación actualizada exitosamente',
      listing: result.rows[0],
    })
  } catch (error) {
    console.error('Error al actualizar listing:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la publicación' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para eliminar' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verificar que el listing existe y pertenece al usuario
    const existingListing = await pool.query(
      `SELECT user_id FROM listings WHERE id = $1`,
      [id]
    )

    if (existingListing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    if (existingListing.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta publicación' },
        { status: 403 }
      )
    }

    // Eliminar el listing
    await pool.query(`DELETE FROM listings WHERE id = $1`, [id])

    return NextResponse.json({
      message: 'Publicación eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar listing:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la publicación' },
      { status: 500 }
    )
  }
}
