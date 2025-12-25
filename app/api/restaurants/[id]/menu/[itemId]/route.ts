// API route para actualizar y eliminar platos del menú
// PUT /api/restaurants/[id]/menu/[itemId] - Actualizar plato
// DELETE /api/restaurants/[id]/menu/[itemId] - Eliminar plato

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getRestaurantById } from '@/lib/restaurant-queries'
import { pool } from '@/lib/db'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  available: z.boolean().default(true),
})

// PUT - Actualizar plato
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = parseInt(params.itemId)
    
    if (isNaN(restaurantId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
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

    // Verificar que el plato pertenece al restaurante
    const itemCheck = await pool.query(
      'SELECT id FROM menu_items WHERE id = $1 AND restaurant_id = $2',
      [itemId, restaurantId]
    )

    if (itemCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plato no encontrado' },
        { status: 404 }
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
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, image_url = $4, available = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND restaurant_id = $7
       RETURNING id, restaurant_id, name, description, price, image_url, available, created_at, updated_at`,
      [name, description || null, price, image_url || null, available, itemId, restaurantId]
    )

    return NextResponse.json(
      { 
        message: 'Plato actualizado exitosamente',
        menu_item: result.rows[0]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando plato:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el plato' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar plato
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const itemId = parseInt(params.itemId)
    
    if (isNaN(restaurantId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
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

    // Verificar que el plato pertenece al restaurante
    const itemCheck = await pool.query(
      'SELECT id FROM menu_items WHERE id = $1 AND restaurant_id = $2',
      [itemId, restaurantId]
    )

    if (itemCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plato no encontrado' },
        { status: 404 }
      )
    }

    await pool.query(
      'DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2',
      [itemId, restaurantId]
    )

    return NextResponse.json(
      { message: 'Plato eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error eliminando plato:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el plato' },
      { status: 500 }
    )
  }
}

