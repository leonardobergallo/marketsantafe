// API: Obtener estado del wizard para reanudar
// GET /api/leads/[id]/resume

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leadId = parseInt(id)

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener lead
    const leadResult = await pool.query(
      `SELECT id, tenant_id, property_id, flow_type, user_type, source, status,
              name, email, whatsapp, zone, property_type, budget_min, budget_max, budget,
              bedrooms, area_m2, condition, address
       FROM leads WHERE id = $1`,
      [leadId]
    )

    if (leadResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    const lead = leadResult.rows[0]

    // Obtener todos los steps guardados
    const stepsResult = await pool.query(
      'SELECT step_key, value FROM lead_steps WHERE lead_id = $1 ORDER BY created_at',
      [leadId]
    )

    const steps: Record<string, any> = {}
    stepsResult.rows.forEach((row: any) => {
      try {
        steps[row.step_key] = JSON.parse(row.value)
      } catch {
        steps[row.step_key] = row.value
      }
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        tenant_id: lead.tenant_id,
        property_id: lead.property_id,
        flow_type: lead.flow_type,
        user_type: lead.user_type,
        source: lead.source,
        status: lead.status,
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        zone: lead.zone,
        property_type: lead.property_type,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        budget: lead.budget,
        bedrooms: lead.bedrooms,
        area_m2: lead.area_m2,
        condition: lead.condition,
        address: lead.address,
      },
      steps,
    })
  } catch (error: any) {
    console.error('Error obteniendo estado del wizard:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado', details: error.message },
      { status: 500 }
    )
  }
}


