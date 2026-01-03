// API: Enviar lead (validar y cambiar a estado "new")
// POST /api/leads/[id]/submit

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leadId = parseInt(id)

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const formData = body

    // Obtener lead
    const leadResult = await pool.query(
      'SELECT id, flow_type, status FROM leads WHERE id = $1',
      [leadId]
    )

    if (leadResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    const lead = leadResult.rows[0]

    if (lead.status !== 'draft') {
      return NextResponse.json(
        { error: 'Este lead ya fue enviado' },
        { status: 400 }
      )
    }

    // Validaciones básicas según flow_type
    const flowType = lead.flow_type
    const errors: string[] = []

    // Todos los flujos requieren nombre y contacto
    if (!formData.nombre && !formData.name) {
      errors.push('El nombre es requerido')
    }
    if (!formData.whatsapp && !formData.telefono) {
      errors.push('El WhatsApp o teléfono es requerido')
    }

    // Validaciones específicas por flujo
    if (flowType === 'ALQUILAR' || flowType === 'COMPRAR') {
      if (!formData.zona) {
        errors.push('La zona es requerida')
      }
      if (flowType === 'COMPRAR' && !formData.presupuesto_min && !formData.presupuesto_max) {
        errors.push('El rango de presupuesto es requerido')
      }
      if (flowType === 'ALQUILAR' && !formData.presupuesto) {
        errors.push('El presupuesto mensual es requerido')
      }
    }

    if (flowType === 'VENDER' || flowType === 'TASACION') {
      if (!formData.direccion) {
        errors.push('La dirección es requerida')
      }
      if (!formData.tipo) {
        errors.push('El tipo de propiedad es requerido')
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Errores de validación', errors }, { status: 400 })
    }

    // Actualizar lead con todos los datos
    await pool.query(
      `UPDATE leads 
       SET name = $1,
           email = $2,
           whatsapp = $3,
           zone = $4,
           property_type = $5,
           budget_min = $6,
           budget_max = $7,
           budget = $8,
           bedrooms = $9,
           area_m2 = $10,
           condition = $11,
           address = $12,
           status = 'new',
           submitted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13`,
      [
        formData.nombre || formData.name || null,
        formData.email || null,
        formData.whatsapp || formData.telefono || null,
        formData.zona || null,
        formData.tipo || formData.property_type || null,
        formData.presupuesto_min ? parseFloat(formData.presupuesto_min) : null,
        formData.presupuesto_max ? parseFloat(formData.presupuesto_max) : null,
        formData.presupuesto ? parseFloat(formData.presupuesto) : null,
        formData.dormitorios ? parseInt(formData.dormitorios) : null,
        formData.m2 ? parseFloat(formData.m2) : null,
        formData.estado || formData.condition || null,
        formData.direccion || formData.address || null,
        leadId,
      ]
    )

    // Crear notificación para el tenant
    const tenantResult = await pool.query(
      'SELECT tenant_id FROM leads WHERE id = $1',
      [leadId]
    )
    const tenantId = tenantResult.rows[0]?.tenant_id

    if (tenantId) {
      await pool.query(
        `INSERT INTO notifications (tenant_id, type, payload, created_at)
         VALUES ($1, 'new_lead', $2, CURRENT_TIMESTAMP)`,
        [
          tenantId,
          JSON.stringify({
            lead_id: leadId,
            flow_type: flowType,
            message: 'Nuevo lead recibido',
          }),
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead enviado exitosamente',
      lead_id: leadId,
    })
  } catch (error: any) {
    console.error('Error enviando lead:', error)
    return NextResponse.json(
      { error: 'Error al enviar lead', details: error.message },
      { status: 500 }
    )
  }
}


