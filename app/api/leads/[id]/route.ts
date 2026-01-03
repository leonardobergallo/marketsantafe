// API: Obtener/Actualizar lead
// GET /api/leads/[id]
// PATCH /api/leads/[id]

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { canAccessTenant, requireTenantUser } from '@/lib/auth-tenant'

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

    const result = await pool.query(
      `SELECT 
        l.*,
        t.name as tenant_name,
        p.title as property_title,
        u.name as assigned_to_name
       FROM leads l
       LEFT JOIN tenants t ON l.tenant_id = t.id
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to_user_id = u.id
       WHERE l.id = $1`,
      [leadId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    const lead = result.rows[0]

    // Verificar acceso
    const hasAccess = await canAccessTenant(lead.tenant_id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        tenant_id: lead.tenant_id,
        tenant_name: lead.tenant_name,
        property_id: lead.property_id,
        property_title: lead.property_title,
        flow_type: lead.flow_type,
        user_type: lead.user_type,
        source: lead.source,
        status: lead.status,
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        zone: lead.zone,
        property_type: lead.property_type,
        budget_min: lead.budget_min ? parseFloat(lead.budget_min) : null,
        budget_max: lead.budget_max ? parseFloat(lead.budget_max) : null,
        budget: lead.budget ? parseFloat(lead.budget) : null,
        bedrooms: lead.bedrooms,
        area_m2: lead.area_m2 ? parseFloat(lead.area_m2) : null,
        condition: lead.condition,
        address: lead.address,
        assigned_to_user_id: lead.assigned_to_user_id,
        assigned_to_name: lead.assigned_to_name,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        submitted_at: lead.submitted_at,
      },
    })
  } catch (error: any) {
    console.error('Error obteniendo lead:', error)
    return NextResponse.json(
      { error: 'Error al obtener lead', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireTenantUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    const leadId = parseInt(id)

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { status, assigned_to_user_id } = body

    // Obtener lead para verificar tenant
    const leadResult = await pool.query(
      'SELECT tenant_id FROM leads WHERE id = $1',
      [leadId]
    )

    if (leadResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    const leadTenantId = leadResult.rows[0].tenant_id

    // Verificar que el usuario puede acceder a este tenant
    if (user.tenant_id !== leadTenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Construir update dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (assigned_to_user_id !== undefined) {
      updates.push(`assigned_to_user_id = $${paramIndex}`)
      values.push(assigned_to_user_id || null)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(leadId)

    await pool.query(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    return NextResponse.json({
      success: true,
      message: 'Lead actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('Error actualizando lead:', error)
    return NextResponse.json(
      { error: 'Error al actualizar lead', details: error.message },
      { status: 500 }
    )
  }
}

