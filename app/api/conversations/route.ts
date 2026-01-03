// API: Crear conversación
// POST /api/conversations

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { property_id, listing_id, buyer_name, buyer_email, buyer_whatsapp } = body

    if ((!property_id && !listing_id) || !buyer_name) {
      return NextResponse.json(
        { error: 'property_id o listing_id, y buyer_name son requeridos' },
        { status: 400 }
      )
    }

    let seller_id: number | null = null

    // Obtener el seller_id según el tipo
    if (property_id) {
      const propertyResult = await pool.query(
        'SELECT user_id FROM properties WHERE id = $1',
        [property_id]
      )

      if (propertyResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      seller_id = propertyResult.rows[0].user_id
    } else if (listing_id) {
      const listingResult = await pool.query(
        'SELECT user_id FROM listings WHERE id = $1',
        [listing_id]
      )

      if (listingResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }

      seller_id = listingResult.rows[0].user_id
    }

    if (!seller_id) {
      return NextResponse.json(
        { error: 'No se pudo determinar el vendedor' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una conversación activa
    const existingConv = await pool.query(
      `SELECT id FROM conversations 
       WHERE (property_id = $1 OR listing_id = $2) AND buyer_email = $3 AND status = 'active'
       LIMIT 1`,
      [property_id || null, listing_id || null, buyer_email || null]
    )

    if (existingConv.rows.length > 0) {
      return NextResponse.json({
        success: true,
        conversation: {
          id: existingConv.rows[0].id,
          existing: true,
        },
      })
    }

    // Crear nueva conversación
    const result = await pool.query(
      `INSERT INTO conversations (property_id, listing_id, seller_id, buyer_name, buyer_email, buyer_whatsapp, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, property_id, listing_id, seller_id, buyer_name, buyer_email, buyer_whatsapp, status, created_at`,
      [property_id || null, listing_id || null, seller_id, buyer_name, buyer_email || null, buyer_whatsapp || null]
    )

    const conversation = result.rows[0]

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        property_id: conversation.property_id,
        listing_id: conversation.listing_id,
        seller_id: conversation.seller_id,
        buyer_name: conversation.buyer_name,
        buyer_email: conversation.buyer_email,
        buyer_whatsapp: conversation.buyer_whatsapp,
        status: conversation.status,
        created_at: conversation.created_at,
        existing: false,
      },
    })
  } catch (error: any) {
    console.error('Error creando conversación:', error)
    return NextResponse.json(
      { error: 'Error al crear conversación', details: error.message },
      { status: 500 }
    )
  }
}

