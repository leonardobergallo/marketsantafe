// API: Bandeja de leads para market admin (vista global)
// GET /api/admin/leads

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireMarketAdmin } from '@/lib/auth-tenant'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireMarketAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')
    const status = searchParams.get('status')
    const flowType = searchParams.get('flow_type')
    const userType = searchParams.get('user_type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Construir query con filtros
    let whereConditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    if (tenantId) {
      whereConditions.push(`l.tenant_id = $${paramIndex}`)
      queryParams.push(parseInt(tenantId))
      paramIndex++
    }

    if (status) {
      whereConditions.push(`l.status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (flowType) {
      whereConditions.push(`l.flow_type = $${paramIndex}`)
      queryParams.push(flowType)
      paramIndex++
    }

    if (userType) {
      whereConditions.push(`l.user_type = $${paramIndex}`)
      queryParams.push(userType)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    // Contar total
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM leads l ${whereClause}`,
      queryParams
    )
    const total = parseInt(countResult.rows[0].total)

    // Obtener leads con info de tenant
    queryParams.push(limit, offset)
    const result = await pool.query(
      `SELECT 
        l.id, l.tenant_id, l.property_id, l.flow_type, l.user_type, l.source, l.status,
        l.name, l.email, l.whatsapp, l.zone, l.property_type, l.budget_min, l.budget_max,
        l.budget, l.bedrooms, l.area_m2, l.condition, l.address,
        l.assigned_to_user_id, l.created_at, l.updated_at, l.submitted_at,
        t.name as tenant_name, t.slug as tenant_slug,
        p.title as property_title,
        u.name as assigned_to_name
       FROM leads l
       LEFT JOIN tenants t ON l.tenant_id = t.id
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to_user_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    )

    const leads = result.rows.map((row: any) => ({
      id: row.id,
      tenant_id: row.tenant_id,
      tenant_name: row.tenant_name,
      tenant_slug: row.tenant_slug,
      property_id: row.property_id,
      property_title: row.property_title,
      flow_type: row.flow_type,
      user_type: row.user_type,
      source: row.source,
      status: row.status,
      name: row.name,
      email: row.email,
      whatsapp: row.whatsapp,
      zone: row.zone,
      property_type: row.property_type,
      budget_min: row.budget_min ? parseFloat(row.budget_min) : null,
      budget_max: row.budget_max ? parseFloat(row.budget_max) : null,
      budget: row.budget ? parseFloat(row.budget) : null,
      bedrooms: row.bedrooms,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
      condition: row.condition,
      address: row.address,
      assigned_to_user_id: row.assigned_to_user_id,
      assigned_to_name: row.assigned_to_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      submitted_at: row.submitted_at,
    }))

    return NextResponse.json({
      success: true,
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error obteniendo leads:', error)
    return NextResponse.json(
      { error: 'Error al obtener leads', details: error.message },
      { status: 500 }
    )
  }
}


