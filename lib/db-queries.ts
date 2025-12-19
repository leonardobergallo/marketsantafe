// Funciones helper para consultar la base de datos
import { pool } from './db'
import { type Listing } from './mockListings'

export interface ListingFilters {
  q?: string
  category?: string
  zone?: string
  min?: number
  max?: number
  condition?: 'nuevo' | 'usado' | 'reacondicionado'
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  try {
    // Construir query
    let query = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.image_url,
        l.images,
        l.featured,
        l.active,
        l.views,
        l.created_at,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug,
        u.whatsapp,
        u.phone
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.active = true
    `
    
    const params: any[] = []
    let paramCount = 0

    // Filtro por búsqueda de texto
    if (filters.q) {
      paramCount++
      query += ` AND (l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`
      params.push(`%${filters.q}%`)
    }

    // Filtro por categoría
    if (filters.category) {
      paramCount++
      query += ` AND c.slug = $${paramCount}`
      params.push(filters.category)
    }

    // Filtro por zona
    if (filters.zone) {
      paramCount++
      query += ` AND z.slug = $${paramCount}`
      params.push(filters.zone)
    }

    // Filtro por precio mínimo
    if (filters.min !== undefined) {
      paramCount++
      query += ` AND l.price >= $${paramCount}`
      params.push(filters.min)
    }

    // Filtro por precio máximo
    if (filters.max !== undefined) {
      paramCount++
      query += ` AND l.price <= $${paramCount}`
      params.push(filters.max)
    }

    // Filtro por condición
    if (filters.condition) {
      paramCount++
      query += ` AND l.condition = $${paramCount}`
      params.push(filters.condition)
    }

    // Ordenar por featured primero, luego por fecha
    query += ` ORDER BY l.featured DESC, l.created_at DESC`

    const result = await pool.query(query, params)

    // Transformar resultados
    const listings: Listing[] = result.rows.map((row: any) => {
      // Parsear imágenes si es JSON
      let images: string[] = []
      if (row.images) {
        try {
          images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
        } catch (e) {
          images = []
        }
      }
      
      // Si no hay imágenes pero hay image_url, usar image_url
      if (images.length === 0 && row.image_url) {
        images = [row.image_url]
      }

      return {
        id: row.id.toString(),
        title: row.title,
        price: parseFloat(row.price) || 0,
        categoryId: row.category_id?.toString() || '',
        zoneId: row.zone_id?.toString() || '',
        condition: row.condition || 'usado',
        description: row.description || '',
        imageUrl: row.image_url || images[0] || '/placeholder.jpg',
        images: images.length > 0 ? images : undefined,
        createdAt: row.created_at.toISOString(),
        whatsapp: row.whatsapp || undefined,
        phone: row.phone || undefined,
        featured: row.featured || false,
      }
    })

    return listings
  } catch (error) {
    console.error('Error obteniendo listings:', error)
    return []
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const listingId = parseInt(id)

    if (isNaN(listingId)) {
      return null
    }

    const result = await pool.query(
      `SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.image_url,
        l.images,
        l.featured,
        l.active,
        l.views,
        l.created_at,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug,
        u.whatsapp,
        u.phone,
        u.name as user_name,
        u.is_business,
        u.business_name
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN zones z ON l.zone_id = z.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1 AND l.active = true`,
      [listingId]
    )

    if (result.rows.length === 0) {
      return null
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
    
    // Si no hay imágenes pero hay image_url, usar image_url
    if (images.length === 0 && row.image_url) {
      images = [row.image_url]
    }

    return {
      id: row.id.toString(),
      title: row.title,
      price: parseFloat(row.price) || 0,
      categoryId: row.category_id?.toString() || '',
      zoneId: row.zone_id?.toString() || '',
      condition: row.condition || 'usado',
      description: row.description || '',
      imageUrl: row.image_url || images[0] || '/placeholder.jpg',
      images: images.length > 0 ? images : undefined,
      createdAt: row.created_at.toISOString(),
      whatsapp: row.whatsapp || undefined,
      phone: row.phone || undefined,
      featured: row.featured || false,
    }
  } catch (error) {
    console.error('Error obteniendo listing:', error)
    return null
  }
}

