// API route para publicar un restaurante
// POST /api/publish/restaurant

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación
const restaurantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  foodType: z.string().optional(),
  zoneId: z.string().min(1, 'La zona es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  hours: z.string().optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  delivery: z.boolean().default(false),
  pickup: z.boolean().default(true),
  image_url: z.string().optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
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
    const validationResult = restaurantSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const {
      name,
      foodType,
      zoneId,
      description,
      hours,
      whatsapp,
      phone,
      delivery,
      pickup,
      image_url,
      images,
      address,
      latitude,
      longitude,
    } = validationResult.data

    // Verificar que zoneId sea un número válido
    const zoneIdNum = zoneId === 'all' ? null : parseInt(zoneId)

    if (zoneIdNum === null || isNaN(zoneIdNum)) {
      return NextResponse.json(
        { error: 'Zona inválida' },
        { status: 400 }
      )
    }

    // Preparar imágenes (máximo 3)
    const imagesArray = images && images.length > 0 
      ? images.slice(0, 3).filter(img => img && img.trim() !== '')
      : (image_url ? [image_url] : [])
    
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null

    // Insertar restaurante
    const result = await pool.query(
      `INSERT INTO restaurants (user_id, zone_id, name, description, food_type, image_url, images, address, latitude, longitude, phone, whatsapp, delivery, pickup, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, name, created_at`,
      [
        user.id,
        zoneIdNum,
        name,
        description,
        foodType || null,
        primaryImage,
        JSON.stringify(imagesArray),
        address || null,
        latitude || null,
        longitude || null,
        phone || user.phone,
        whatsapp || user.whatsapp,
        delivery,
        pickup,
        true,
      ]
    )

    const restaurant = result.rows[0]

    return NextResponse.json(
      {
        message: 'Restaurante creado exitosamente',
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          created_at: restaurant.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al publicar restaurante:', error)
    return NextResponse.json(
      { error: 'Error al crear el restaurante' },
      { status: 500 }
    )
  }
}

