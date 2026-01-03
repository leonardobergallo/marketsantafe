// API route para solicitar servicio profesional
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
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
    const propertyCheck = await pool.query(
      'SELECT id, professional_service FROM properties WHERE id = $1 AND user_id = $2',
      [propertyId, user.id]
    )

    if (propertyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no tenés permisos' },
        { status: 404 }
      )
    }

    if (propertyCheck.rows[0].professional_service) {
      return NextResponse.json(
        { error: 'Ya tenés servicio profesional activo para esta propiedad' },
        { status: 400 }
      )
    }

    // Actualizar propiedad con servicio profesional
    const result = await pool.query(
      `UPDATE properties 
       SET professional_service = true, 
           professional_service_requested_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [propertyId]
    )

    const property = result.rows[0]

    return NextResponse.json({ 
      property,
      message: 'Servicio profesional activado. Te contactaremos pronto.' 
    })
  } catch (error) {
    console.error('Error al activar servicio profesional:', error)
    return NextResponse.json(
      { error: 'Error al activar el servicio profesional' },
      { status: 500 }
    )
  }
}





