// API route para gestionar menú de restaurante
// GET /api/restaurants/[id]/menu - Obtener menú
// POST /api/restaurants/[id]/menu - Agregar plato
// PUT /api/restaurants/[id]/menu/[itemId] - Actualizar plato
// DELETE /api/restaurants/[id]/menu/[itemId] - Eliminar plato

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getRestaurantById, getMenuItemsByRestaurant } from '@/lib/restaurant-queries'
import { pool } from '@/lib/db'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  available: z.boolean().default(true),
})

// GET - Obtener menú del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id)
    
    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: 'ID de restaurante inválido' },
        { status: 400 }
      )
    }

    const menuItems = await getMenuItemsByRestaurant(restaurantId)
    
    return NextResponse.json({ menu_items: menuItems }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo menú:', error)
    return NextResponse.json(
      { error: 'Error al obtener el menú' },
      { status: 500 }
    )
  }
}

// POST - Agregar plato al menú
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const restaurantId = parseInt(params.id)
    
    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: 'ID de restaurante inválido' },
        { status: 400 }
      )
    }

    // Verificar que el restaurante pertenece al usuario
    const restaurant = await getRestaurantById(restaurantId)
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }

    if (restaurant.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No tenés permiso para modificar este restaurante' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Limpiar campos
    if (body.image_url === '') body.image_url = null
    if (body.description === '') body.description = null

    const validationResult = menuItemSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { name, description, price, image_url, available } = validationResult.data

    const result = await pool.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, image_url, available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, restaurant_id, name, description, price, image_url, available, created_at, updated_at`,
      [restaurantId, name, description || null, price, image_url || null, available]
    )

    return NextResponse.json(
      { 
        message: 'Plato agregado exitosamente',
        menu_item: result.rows[0]
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error agregando plato:', error)
    return NextResponse.json(
      { error: 'Error al agregar el plato' },
      { status: 500 }
    )
  }
}

