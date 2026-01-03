// API route para crear y obtener tiendas
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createStoreSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zone_id: z.string().optional(),
})

// POST - Crear tienda
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Limpiar campos vacíos
    const cleanBody: any = {}
    Object.keys(body).forEach(key => {
      if (body[key] !== '' && body[key] !== null && body[key] !== undefined) {
        cleanBody[key] = body[key]
      }
    })

    const validationResult = createStoreSchema.safeParse(cleanBody)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verificar si el usuario ya tiene una tienda
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE user_id = $1',
      [user.id]
    )

    if (existingStore.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya tenés una tienda creada' },
        { status: 409 }
      )
    }

    // Generar slug único
    const baseSlug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    let slug = baseSlug
    let counter = 1
    while (true) {
      const slugCheck = await pool.query(
        'SELECT id FROM stores WHERE slug = $1',
        [slug]
      )
      if (slugCheck.rows.length === 0) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear tienda
    const result = await pool.query(
      `INSERT INTO stores (
        user_id, name, slug, description, logo_url, cover_image_url,
        phone, whatsapp, email, instagram, address, zone_id, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        user.id,
        data.name,
        slug,
        data.description || null,
        data.logo_url || null,
        data.cover_image_url || null,
        data.phone || null,
        data.whatsapp || null,
        data.email || null,
        data.instagram || null,
        data.address || null,
        data.zone_id ? parseInt(data.zone_id) : null,
        true,
      ]
    )

    const store = result.rows[0]

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error('Error al crear tienda:', error)
    return NextResponse.json(
      { error: 'Error al crear la tienda' },
      { status: 500 }
    )
  }
}

// GET - Obtener mi tienda
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT s.*, z.name as zone_name, z.slug as zone_slug
       FROM stores s
       LEFT JOIN zones z ON s.zone_id = z.id
       WHERE s.user_id = $1 AND s.active = true`,
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ store: null }, { status: 200 })
    }

    const store = result.rows[0]

    // Obtener cantidad de productos
    const productsCount = await pool.query(
      'SELECT COUNT(*) as count FROM listings WHERE store_id = $1 AND active = true',
      [store.id]
    )
    store.products_count = parseInt(productsCount.rows[0].count)

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error al obtener tienda:', error)
    return NextResponse.json(
      { error: 'Error al obtener la tienda' },
      { status: 500 }
    )
  }
}





