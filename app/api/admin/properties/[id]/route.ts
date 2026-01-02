// API route para gestionar propiedades individuales (solo admin)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-admin'

// PUT - Actualizar una propiedad (admin)
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
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { active, featured, professional_service } = body

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
    if (professional_service !== undefined) {
      paramCount++
      updates.push(`professional_service = $${paramCount}`)
      values.push(professional_service)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    paramCount++
    values.push(propertyId)

    const query = `
      UPDATE properties
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, active, featured, professional_service
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ property: result.rows[0] })
  } catch (error) {
    console.error('Error actualizando propiedad:', error)
    return NextResponse.json(
      { error: 'Error al actualizar propiedad' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una propiedad (admin)
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
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING id, title',
      [propertyId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Propiedad eliminada exitosamente',
      property: result.rows[0]
    })
  } catch (error) {
    console.error('Error eliminando propiedad:', error)
    return NextResponse.json(
      { error: 'Error al eliminar propiedad' },
      { status: 500 }
    )
  }
}

