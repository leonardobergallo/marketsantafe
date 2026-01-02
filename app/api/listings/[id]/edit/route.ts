// API route para obtener un listing para editar (verifica que pertenezca al usuario)
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    // Obtener listing y verificar que pertenece al usuario
    const result = await pool.query(
      `SELECT 
        l.*,
        c.id as category_id,
        z.id as zone_id
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       LEFT JOIN zones z ON l.zone_id = z.id
       WHERE l.id = $1 AND l.user_id = $2`,
      [listingId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado o no tienes permiso para editarlo' },
        { status: 404 }
      )
    }

    const row = result.rows[0]

    // Parsear imágenes
    let images: string[] = []
    if (row.images) {
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
      } catch (e) {
        images = []
      }
    }
    if (images.length === 0 && row.image_url) {
      images = [row.image_url]
    }

    const listing = {
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price) || 0,
      currency: row.currency || 'ARS',
      category_id: row.category_id?.toString() || '',
      zone_id: row.zone_id?.toString() || '',
      condition: row.condition || null,
      images,
      image_url: row.image_url,
      whatsapp: row.whatsapp,
      phone: row.phone,
      email: row.email,
      instagram: row.instagram,
    }

    return NextResponse.json({ listing }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener producto para editar:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

