// API: Inicializar lead (crear en estado draft)
// POST /api/leads/init

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { InitLeadRequest, FlowType, SourceType } from '@/lib/leads-types'

export async function POST(request: NextRequest) {
  try {
    const body: InitLeadRequest = await request.json()
    const { tenant_id, property_id, flow_type, source } = body

    // Validaciones
    if (!flow_type || !['ALQUILAR', 'COMPRAR', 'VENDER', 'TASACION', 'CONTACTO'].includes(flow_type)) {
      return NextResponse.json(
        { error: 'flow_type es requerido y debe ser válido' },
        { status: 400 }
      )
    }

    if (!source) {
      return NextResponse.json(
        { error: 'source es requerido' },
        { status: 400 }
      )
    }

    // Determinar user_type según flow_type
    const user_type = flow_type === 'VENDER' || flow_type === 'TASACION' ? 'seller' : 'buyer'

    // Si viene property_id, obtener tenant_id de la propiedad
    let finalTenantId = tenant_id
    if (property_id && !tenant_id) {
      const propertyResult = await pool.query(
        'SELECT tenant_id FROM properties WHERE id = $1',
        [property_id]
      )
      if (propertyResult.rows.length > 0) {
        finalTenantId = propertyResult.rows[0].tenant_id
      }
    }

    // Si no hay tenant_id, usar el marketplace por defecto
    if (!finalTenantId) {
      const marketplaceResult = await pool.query(
        "SELECT id FROM tenants WHERE slug = 'marketplace' LIMIT 1"
      )
      if (marketplaceResult.rows.length > 0) {
        finalTenantId = marketplaceResult.rows[0].id
      }
    }

    // Crear lead en estado draft
    const result = await pool.query(
      `INSERT INTO leads (tenant_id, property_id, flow_type, user_type, source, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING id, tenant_id, property_id, flow_type, user_type, source, status, created_at`,
      [finalTenantId, property_id || null, flow_type, user_type, source]
    )

    const lead = result.rows[0]

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
        created_at: lead.created_at,
      },
    })
  } catch (error: any) {
    console.error('Error inicializando lead:', error)
    return NextResponse.json(
      { error: 'Error al inicializar lead', details: error.message },
      { status: 500 }
    )
  }
}


