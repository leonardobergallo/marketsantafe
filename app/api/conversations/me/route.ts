// API: Obtener conversaciones del usuario actual (vendedor)
// GET /api/conversations/me

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener conversaciones donde el usuario es el vendedor
    const result = await pool.query(
      `SELECT 
        c.id,
        c.property_id,
        c.listing_id,
        c.seller_id,
        c.buyer_name,
        c.buyer_email,
        c.buyer_whatsapp,
        c.status,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        COALESCE(p.title, l.title) as item_title,
        COALESCE(p.image_url, l.image_url) as item_image,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_type = 'buyer' AND m.read_at IS NULL) as unread_count
       FROM conversations c
       LEFT JOIN properties p ON c.property_id = p.id
       LEFT JOIN listings l ON c.listing_id = l.id
       WHERE c.seller_id = $1
       ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
      [user.id]
    )

    return NextResponse.json({
      success: true,
      conversations: result.rows.map((row) => ({
        id: row.id,
        property_id: row.property_id,
        listing_id: row.listing_id,
        seller_id: row.seller_id,
        buyer_name: row.buyer_name,
        buyer_email: row.buyer_email,
        buyer_whatsapp: row.buyer_whatsapp,
        status: row.status,
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        item_title: row.item_title,
        item_image: row.item_image,
        unread_count: parseInt(row.unread_count) || 0,
      })),
    })
  } catch (error: any) {
    console.error('Error obteniendo conversaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener conversaciones', details: error.message },
      { status: 500 }
    )
  }
}
