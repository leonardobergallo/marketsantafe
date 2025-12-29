// API route para obtener y actualizar tienda por ID o slug
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const updateStoreSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zone_id: z.string().optional(),
  active: z.boolean().optional(),
})

// GET - Obtener tienda por ID o slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Determinar si es un ID numérico o un slug
    const isNumeric = /^\d+$/.test(id)
    
    let storeResult
    if (isNumeric) {
      // Buscar por ID
      storeResult = await pool.query(
        `SELECT s.*, z.name as zone_name, z.slug as zone_slug,
                u.name as user_name, u.avatar_url as user_avatar
         FROM stores s
         LEFT JOIN zones z ON s.zone_id = z.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1 AND s.active = true`,
        [parseInt(id)]
      )
    } else {
      // Buscar por slug
      storeResult = await pool.query(
        `SELECT s.*, z.name as zone_name, z.slug as zone_slug,
                u.name as user_name, u.avatar_url as user_avatar
         FROM stores s
         LEFT JOIN zones z ON s.zone_id = z.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.slug = $1 AND s.active = true`,
        [id]
      )
    }

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    const store = storeResult.rows[0]

    // Obtener productos de la tienda
    const productsResult = await pool.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.store_id = $1 AND l.active = true
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [store.id]
    )

    store.products = productsResult.rows.map((row: any) => {
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

      return {
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        condition: row.condition,
        images,
        category_name: row.category_name,
        category_slug: row.category_slug,
        created_at: row.created_at,
      }
    })

    // Contar productos
    store.products_count = store.products.length

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error al obtener tienda:', error)
    return NextResponse.json(
      { error: 'Error al obtener la tienda' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar tienda
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const storeId = parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json(
        { error: 'ID de tienda inválido' },
        { status: 400 }
      )
    }

    // Verificar que la tienda pertenece al usuario
    const storeCheck = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND user_id = $2',
      [storeId, user.id]
    )

    if (storeCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tienda no encontrada o no tenés permisos' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Limpiar campos vacíos
    const cleanBody: any = {}
    Object.keys(body).forEach(key => {
      if (body[key] !== '' && body[key] !== null && body[key] !== undefined) {
        cleanBody[key] = body[key]
      }
    })

    const validationResult = updateStoreSchema.safeParse(cleanBody)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Construir query de actualización dinámicamente
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount}`)
      values.push(data.name)
      paramCount++
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(data.description || null)
      paramCount++
    }
    if (data.logo_url !== undefined) {
      updates.push(`logo_url = $${paramCount}`)
      values.push(data.logo_url || null)
      paramCount++
    }
    if (data.cover_image_url !== undefined) {
      updates.push(`cover_image_url = $${paramCount}`)
      values.push(data.cover_image_url || null)
      paramCount++
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount}`)
      values.push(data.phone || null)
      paramCount++
    }
    if (data.whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramCount}`)
      values.push(data.whatsapp || null)
      paramCount++
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount}`)
      values.push(data.email || null)
      paramCount++
    }
    if (data.instagram !== undefined) {
      updates.push(`instagram = $${paramCount}`)
      values.push(data.instagram || null)
      paramCount++
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramCount}`)
      values.push(data.address || null)
      paramCount++
    }
    if (data.zone_id !== undefined) {
      updates.push(`zone_id = $${paramCount}`)
      values.push(data.zone_id ? parseInt(data.zone_id) : null)
      paramCount++
    }
    if (data.active !== undefined) {
      updates.push(`active = $${paramCount}`)
      values.push(data.active)
      paramCount++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(storeId)

    const query = `
      UPDATE stores 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)
    const store = result.rows[0]

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error al actualizar tienda:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la tienda' },
      { status: 500 }
    )
  }
}

