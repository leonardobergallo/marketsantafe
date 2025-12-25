// Funciones helper para consultar restaurantes y menús

import { query, queryOne } from './db'

export interface Restaurant {
  id: number
  user_id: number
  zone_id: number | null
  name: string
  description: string | null
  food_type: string | null
  image_url: string | null
  logo_url: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  whatsapp: string | null
  delivery: boolean
  pickup: boolean
  active: boolean
  created_at: Date
  updated_at: Date
  zone_name?: string
  zone_slug?: string
  menu_items?: MenuItem[]
  hours?: RestaurantHour[]
}

export interface MenuItem {
  id: number
  restaurant_id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  created_at: Date
  updated_at: Date
}

export interface RestaurantHour {
  id: number
  restaurant_id: number
  day_of_week: number // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

// Obtener todos los restaurantes activos
export async function getRestaurants(filters: {
  zone?: string
  foodType?: string
  active?: boolean
} = {}): Promise<Restaurant[]> {
  try {
    let sql = `
      SELECT 
        r.id,
        r.user_id,
        r.zone_id,
        r.name,
        r.description,
        r.food_type,
        r.image_url,
        r.logo_url,
        r.address,
        r.latitude,
        r.longitude,
        r.phone,
        r.whatsapp,
        r.delivery,
        r.pickup,
        r.active,
        r.created_at,
        r.updated_at,
        z.name as zone_name,
        z.slug as zone_slug
      FROM restaurants r
      LEFT JOIN zones z ON r.zone_id = z.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0

    if (filters.active !== false) {
      paramCount++
      sql += ` AND r.active = $${paramCount}`
      params.push(true)
    }

    if (filters.zone) {
      paramCount++
      sql += ` AND z.id = $${paramCount}`
      params.push(parseInt(filters.zone))
    }

    if (filters.foodType) {
      paramCount++
      sql += ` AND r.food_type ILIKE $${paramCount}`
      params.push(`%${filters.foodType}%`)
    }

    sql += ` ORDER BY r.created_at DESC`

    const restaurants = await query<Restaurant>(sql, params)
    return restaurants
  } catch (error) {
    console.error('Error obteniendo restaurantes:', error)
    return []
  }
}

// Obtener un restaurante por ID con su menú
export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  try {
    const restaurant = await queryOne<Restaurant>(
      `SELECT 
        r.id,
        r.user_id,
        r.zone_id,
        r.name,
        r.description,
        r.food_type,
        r.image_url,
        r.logo_url,
        r.address,
        r.latitude,
        r.longitude,
        r.phone,
        r.whatsapp,
        r.delivery,
        r.pickup,
        r.active,
        r.created_at,
        r.updated_at,
        z.name as zone_name,
        z.slug as zone_slug
      FROM restaurants r
      LEFT JOIN zones z ON r.zone_id = z.id
      WHERE r.id = $1`,
      [id]
    )

    if (!restaurant) return null

    // Obtener menú
    const menuItems = await getMenuItemsByRestaurant(id)
    restaurant.menu_items = menuItems

    // Obtener horarios
    const hours = await getRestaurantHours(id)
    restaurant.hours = hours

    return restaurant
  } catch (error) {
    console.error('Error obteniendo restaurante:', error)
    return null
  }
}

// Obtener restaurantes de un usuario
export async function getUserRestaurants(userId: number): Promise<Restaurant[]> {
  try {
    const restaurants = await query<Restaurant>(
      `SELECT 
        r.id,
        r.user_id,
        r.zone_id,
        r.name,
        r.description,
        r.food_type,
        r.image_url,
        r.logo_url,
        r.address,
        r.latitude,
        r.longitude,
        r.phone,
        r.whatsapp,
        r.delivery,
        r.pickup,
        r.active,
        r.created_at,
        r.updated_at,
        z.name as zone_name,
        z.slug as zone_slug
      FROM restaurants r
      LEFT JOIN zones z ON r.zone_id = z.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    )

    return restaurants
  } catch (error) {
    console.error('Error obteniendo restaurantes del usuario:', error)
    return []
  }
}

// Obtener platos del menú de un restaurante
export async function getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
  try {
    return await query<MenuItem>(
      `SELECT id, restaurant_id, name, description, price, image_url, available, created_at, updated_at
       FROM menu_items
       WHERE restaurant_id = $1
       ORDER BY created_at ASC`,
      [restaurantId]
    )
  } catch (error) {
    console.error('Error obteniendo menú:', error)
    return []
  }
}

// Obtener horarios de un restaurante
export async function getRestaurantHours(restaurantId: number): Promise<RestaurantHour[]> {
  try {
    return await query<RestaurantHour>(
      `SELECT id, restaurant_id, day_of_week, open_time, close_time, is_closed
       FROM restaurant_hours
       WHERE restaurant_id = $1
       ORDER BY day_of_week ASC`,
      [restaurantId]
    )
  } catch (error) {
    console.error('Error obteniendo horarios:', error)
    return []
  }
}

