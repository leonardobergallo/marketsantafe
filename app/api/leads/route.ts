// API route para crear leads de consultas sobre propiedades
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createLeadSchema = z.object({
  propertyId: z.string().min(1),
  agencyId: z.string().nullable().optional(),
  nombre: z.string().min(2),
  telefono: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  mensaje: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = createLeadSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Por ahora, solo logueamos el lead (no hay tabla de leads en DB)
    // En el futuro, si existe tabla leads, se puede insertar aquí
    console.log('📧 Nuevo lead recibido:', {
      propertyId: data.propertyId,
      agencyId: data.agencyId,
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email || 'No proporcionado',
      mensaje: data.mensaje,
      timestamp: new Date().toISOString(),
    })

    // TODO: Si existe tabla leads en DB, insertar aquí
    // TODO: Enviar notificación a la inmobiliaria si agencyId existe
    // TODO: Enviar notificación a la plataforma si agencyId es null

    return NextResponse.json(
      {
        success: true,
        message: 'Tu consulta ha sido enviada correctamente',
        lead: {
          propertyId: data.propertyId,
          agencyId: data.agencyId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando lead:', error)
    return NextResponse.json(
      { error: 'Error al procesar tu consulta' },
      { status: 500 }
    )
  }
}




