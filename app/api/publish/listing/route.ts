// API route para publicar un listing del mercado
// POST /api/publish/listing

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'
import { z } from 'zod'

// Schema de validación
const listingSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  zoneId: z.string().min(1, 'La zona es requerida'),
  price: z.string().optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  whatsapp: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para publicar' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar datos
    const validationResult = listingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { title, categoryId, zoneId, price, currency, condition, description, whatsapp, phone, email, instagram, image_url, images } =
      validationResult.data

    // Verificar que categoryId y zoneId sean números válidos
    const categoryIdNum = categoryId === 'all' ? null : parseInt(categoryId)
    const zoneIdNum = zoneId === 'all' ? null : parseInt(zoneId)

    if (categoryIdNum !== null && isNaN(categoryIdNum)) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    if (zoneIdNum === null || isNaN(zoneIdNum)) {
      return NextResponse.json(
        { error: 'Zona inválida' },
        { status: 400 }
      )
    }

    // Verificar límite de publicaciones
    const limitCheck = await checkCanPublish(user.id, 'listing')
    if (!limitCheck.allowed) {
      if (limitCheck.reason === 'limit_reached') {
        return NextResponse.json(
          { 
            error: 'Límite de publicaciones alcanzado',
            current: limitCheck.current,
            limit: limitCheck.limit,
            message: `Tenés ${limitCheck.current}/${limitCheck.limit} publicaciones. Actualizá tu plan para publicar más.`
          },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'No podés publicar. Verificá tu suscripción.' },
        { status: 403 }
      )
    }

    // Preparar imágenes (máximo 3)
    const imagesArray = images && images.length > 0 
      ? images.slice(0, 3).filter(img => img && img.trim() !== '')
      : (image_url ? [image_url] : [])
    
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null

    // Obtener tienda del usuario si existe
    let storeId: number | null = null
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE user_id = $1 AND active = true',
      [user.id]
    )
    if (storeResult.rows.length > 0) {
      storeId = storeResult.rows[0].id
    }

    // Insertar listing
    const result = await pool.query(
      `INSERT INTO listings (user_id, category_id, zone_id, store_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, title, created_at`,
      [
        user.id,
        categoryIdNum,
        zoneIdNum,
        storeId,
        title,
        description,
        price ? parseFloat(price) : 0,
        currency || 'ARS',
        condition || null,
        whatsapp && whatsapp.trim() !== '' ? whatsapp : null,
        phone && phone.trim() !== '' ? phone : null,
        email && email.trim() !== '' ? email : null,
        instagram && instagram.trim() !== '' ? instagram : null,
        primaryImage,
        JSON.stringify(imagesArray),
        true,
      ]
    )

    const listing = result.rows[0]

    return NextResponse.json(
      {
        message: 'Publicación creada exitosamente',
        listing: {
          id: listing.id,
          title: listing.title,
          created_at: listing.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al publicar listing:', error)
    return NextResponse.json(
      { error: 'Error al crear la publicación' },
      { status: 500 }
    )
  }
}

