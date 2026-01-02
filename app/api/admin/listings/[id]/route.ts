// API route para gestionar productos/listings individuales (solo admin)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-admin'

// PUT - Actualizar un producto/listing (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { active, featured } = body

    // Construir query dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 0

    if (active !== undefined) {
      paramCount++
      updates.push(`active = $${paramCount}`)
      values.push(active)
    }
    if (featured !== undefined) {
      paramCount++
      updates.push(`featured = $${paramCount}`)
      values.push(featured)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    paramCount++
    values.push(listingId)

    const query = `
      UPDATE listings
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, active, featured
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ listing: result.rows[0] })
  } catch (error) {
    console.error('Error actualizando producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un producto/listing (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM listings WHERE id = $1 RETURNING id, title',
      [listingId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      listing: result.rows[0]
    })
  } catch (error) {
    console.error('Error eliminando producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}

