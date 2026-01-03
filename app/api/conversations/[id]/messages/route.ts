// API: Obtener/Enviar mensajes de una conversación
// GET /api/conversations/[id]/messages
// POST /api/conversations/[id]/messages

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversationId = parseInt(id)

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener mensajes
    const result = await pool.query(
      `SELECT id, conversation_id, sender_type, sender_id, message_text, read_at, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    )

    return NextResponse.json({
      success: true,
      messages: result.rows.map((row) => ({
        id: row.id,
        conversation_id: row.conversation_id,
        sender_type: row.sender_type,
        sender_id: row.sender_id,
        message_text: row.message_text,
        read_at: row.read_at,
        created_at: row.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes', details: error.message },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { sender_type, sender_id, message_text } = body

    if (!sender_type || !message_text) {
      return NextResponse.json(
        { error: 'sender_type y message_text son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la conversación existe
    const convCheck = await pool.query(
      'SELECT id FROM conversations WHERE id = $1',
      [conversationId]
    )

    if (convCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      )
    }

    // Crear mensaje
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, message_text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, conversation_id, sender_type, sender_id, message_text, read_at, created_at`,
      [conversationId, sender_type, sender_id || null, message_text]
    )

    // Actualizar last_message_at en la conversación
    await pool.query(
      `UPDATE conversations 
       SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [conversationId]
    )

    const message = result.rows[0]

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_type: message.sender_type,
        sender_id: message.sender_id,
        message_text: message.message_text,
        read_at: message.read_at,
        created_at: message.created_at,
      },
    })
  } catch (error: any) {
    console.error('Error enviando mensaje:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje', details: error.message },
      { status: 500 }
    )
  }
}

