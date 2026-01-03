// API: Bandeja de leads por tenant
// GET /api/tenant/[tenantId]/leads

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { canAccessTenant } from '@/lib/auth-tenant'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const tenantIdNum = parseInt(tenantId)

    if (isNaN(tenantIdNum)) {
      return NextResponse.json({ error: 'tenantId inválido' }, { status: 400 })
    }

    // Verificar acceso
    const hasAccess = await canAccessTenant(tenantIdNum)
    if (!hasAccess) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const flowType = searchParams.get('flow_type')
    const userType = searchParams.get('user_type')
    const zone = searchParams.get('zone')
    const propertyId = searchParams.get('property_id')
    const assignedTo = searchParams.get('assigned_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Construir query con filtros
    let whereConditions = ['l.tenant_id = $1']
    const queryParams: any[] = [tenantIdNum]
    let paramIndex = 2

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

    if (zone) {
      whereConditions.push(`l.zone ILIKE $${paramIndex}`)
      queryParams.push(`%${zone}%`)
      paramIndex++
    }

    if (propertyId) {
      whereConditions.push(`l.property_id = $${paramIndex}`)
      queryParams.push(parseInt(propertyId))
      paramIndex++
    }

    if (assignedTo) {
      whereConditions.push(`l.assigned_to_user_id = $${paramIndex}`)
      queryParams.push(parseInt(assignedTo))
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    // Contar total
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM leads l WHERE ${whereClause}`,
      queryParams
    )
    const total = parseInt(countResult.rows[0].total)

    // Obtener leads
    queryParams.push(limit, offset)
    const result = await pool.query(
      `SELECT 
        l.id, l.tenant_id, l.property_id, l.flow_type, l.user_type, l.source, l.status,
        l.name, l.email, l.whatsapp, l.zone, l.property_type, l.budget_min, l.budget_max,
        l.budget, l.bedrooms, l.area_m2, l.condition, l.address,
        l.assigned_to_user_id, l.created_at, l.updated_at, l.submitted_at,
        p.title as property_title,
        u.name as assigned_to_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to_user_id = u.id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    )

    const leads = result.rows.map((row: any) => ({
      id: row.id,
      tenant_id: row.tenant_id,
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


