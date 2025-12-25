// API route para obtener un restaurante por ID
// GET /api/restaurants/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getRestaurantById } from '@/lib/restaurant-queries'

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

    const restaurant = await getRestaurantById(restaurantId)
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ restaurant }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo restaurante:', error)
    return NextResponse.json(
      { error: 'Error al obtener el restaurante' },
      { status: 500 }
    )
  }
}

