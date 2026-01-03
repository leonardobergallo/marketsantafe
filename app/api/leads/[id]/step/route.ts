// API: Guardar paso del wizard (autosave)
// PATCH /api/leads/[id]/step

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PATCH(
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
    const { step_key, value } = body

    if (!step_key) {
      return NextResponse.json({ error: 'step_key es requerido' }, { status: 400 })
    }

    // Verificar que el lead existe y está en draft
    const leadCheck = await pool.query(
      'SELECT id, status FROM leads WHERE id = $1',
      [leadId]
    )

    if (leadCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    // Guardar o actualizar el step
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value)

    await pool.query(
      `INSERT INTO lead_steps (lead_id, step_key, value, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (lead_id, step_key) 
       DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP`,
      [leadId, step_key, valueStr]
    )

    // Actualizar campo correspondiente en leads según step_key
    const updateFieldMap: Record<string, string> = {
      zona: 'zone',
      tipo: 'property_type',
      presupuesto_min: 'budget_min',
      presupuesto_max: 'budget_max',
      presupuesto: 'budget',
      dormitorios: 'bedrooms',
      m2: 'area_m2',
      estado: 'condition',
      direccion: 'address',
      nombre: 'name',
      telefono: 'whatsapp',
      email: 'email',
    }

    const fieldName = updateFieldMap[step_key]
    if (fieldName) {
      let updateValue: any = value
      
      // Convertir tipos según el campo
      if (['budget_min', 'budget_max', 'budget', 'area_m2'].includes(fieldName)) {
        updateValue = value ? parseFloat(value) : null
      } else if (fieldName === 'bedrooms') {
        updateValue = value ? parseInt(value) : null
      }

      if (fieldName === 'budget_min' || fieldName === 'budget_max' || fieldName === 'budget') {
        await pool.query(
          `UPDATE leads SET ${fieldName} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [updateValue, leadId]
        )
      } else if (fieldName === 'bedrooms') {
        await pool.query(
          `UPDATE leads SET ${fieldName} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [updateValue, leadId]
        )
      } else if (fieldName === 'area_m2') {
        await pool.query(
          `UPDATE leads SET ${fieldName} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [updateValue, leadId]
        )
      } else {
        await pool.query(
          `UPDATE leads SET ${fieldName} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [updateValue || null, leadId]
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Paso guardado exitosamente',
    })
  } catch (error: any) {
    console.error('Error guardando paso:', error)
    return NextResponse.json(
      { error: 'Error al guardar paso', details: error.message },
      { status: 500 }
    )
  }
}


