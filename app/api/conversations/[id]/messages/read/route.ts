// API: Marcar mensajes como leídos
// POST /api/conversations/[id]/messages/read

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversationId = parseInt(id)

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Marcar todos los mensajes del comprador como leídos
    await pool.query(
      `UPDATE messages 
       SET read_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $1 
         AND sender_type = 'buyer' 
         AND read_at IS NULL`,
      [conversationId]
    )

    return NextResponse.json({
      success: true,
      message: 'Mensajes marcados como leídos',
    })
  } catch (error: any) {
    console.error('Error marcando mensajes como leídos:', error)
    return NextResponse.json(
      { error: 'Error al marcar mensajes como leídos', details: error.message },
      { status: 500 }
    )
  }
}

