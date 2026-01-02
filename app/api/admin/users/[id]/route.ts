// API route para gestionar usuarios individuales (solo admin)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-admin'

// GET - Obtener un usuario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT 
        id, name, email, phone, whatsapp, is_business, business_name, 
        avatar_url, verified, is_admin, created_at, updated_at
      FROM users
      WHERE id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = result.rows[0]
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un usuario
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
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, phone, whatsapp, is_business, business_name, verified, is_admin } = body

    // Construir query dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 0

    if (name !== undefined) {
      paramCount++
      updates.push(`name = $${paramCount}`)
      values.push(name)
    }
    if (email !== undefined) {
      paramCount++
      updates.push(`email = $${paramCount}`)
      values.push(email)
    }
    if (phone !== undefined) {
      paramCount++
      updates.push(`phone = $${paramCount}`)
      values.push(phone)
    }
    if (whatsapp !== undefined) {
      paramCount++
      updates.push(`whatsapp = $${paramCount}`)
      values.push(whatsapp)
    }
    if (is_business !== undefined) {
      paramCount++
      updates.push(`is_business = $${paramCount}`)
      values.push(is_business)
    }
    if (business_name !== undefined) {
      paramCount++
      updates.push(`business_name = $${paramCount}`)
      values.push(business_name)
    }
    if (verified !== undefined) {
      paramCount++
      updates.push(`verified = $${paramCount}`)
      values.push(verified)
    }
    if (is_admin !== undefined) {
      paramCount++
      updates.push(`is_admin = $${paramCount}`)
      values.push(is_admin)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    paramCount++
    values.push(userId)

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, whatsapp, is_business, business_name, 
                avatar_url, verified, is_admin, created_at, updated_at
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error: any) {
    console.error('Error actualizando usuario:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'El email ya está en uso' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un usuario
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
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // No permitir eliminar al propio admin
    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de administrador' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}

