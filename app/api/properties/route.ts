// API route para obtener propiedades públicas (para clientes) y crear propiedades
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'
import { z } from 'zod'

const createPropertySchema = z.object({
  type: z.enum(['alquiler', 'venta', 'alquiler-temporal']),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  price: z.string().min(1),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  zone_id: z.string().min(1),
  rooms: z.string().optional(),
  bathrooms: z.string().optional(),
  area_m2: z.string().optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  professional_service: z.boolean().optional().default(false),
})

// POST - Crear propiedad
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createPropertySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validar zone_id
    const zoneId = data.zone_id === 'all' ? null : parseInt(data.zone_id)
    if (!zoneId || isNaN(zoneId)) {
      return NextResponse.json(
        { error: 'Zona inválida' },
        { status: 400 }
      )
    }

    // Verificar límite de propiedades
    const limitCheck = await checkCanPublish(user.id, 'property')
    if (!limitCheck.allowed) {
      if (limitCheck.reason === 'limit_reached') {
        return NextResponse.json(
          { 
            error: 'Límite de propiedades alcanzado',
            current: limitCheck.current,
            limit: limitCheck.limit,
            message: `Tenés ${limitCheck.current}/${limitCheck.limit} propiedades. Actualizá tu plan para publicar más.`
          },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'No podés publicar. Verificá tu suscripción.' },
        { status: 403 }
      )
    }

    // Preparar imágenes
    const imagesArray = data.images && data.images.length > 0 
      ? data.images.filter((img: string) => img && img.trim() !== '')
      : []
    
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null
    const imagesJson = imagesArray.length > 0 ? JSON.stringify(imagesArray) : null

    // Insertar propiedad
    const result = await pool.query(
      `INSERT INTO properties (
        user_id, type, title, description, price, currency,
        zone_id, rooms, bathrooms, area_m2, address, latitude, longitude,
        phone, whatsapp, email, instagram,
        image_url, images, professional_service, professional_service_requested_at, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        user.id,
        data.type,
        data.title,
        data.description,
        parseFloat(data.price),
        data.currency || 'ARS',
        zoneId,
        data.rooms ? parseInt(data.rooms) : null,
        data.bathrooms ? parseInt(data.bathrooms) : null,
        data.area_m2 ? parseFloat(data.area_m2) : null,
        data.address || null,
        data.latitude || null,
        data.longitude || null,
        data.phone || null,
        data.whatsapp || null,
        data.email || null,
        data.instagram || null,
        primaryImage,
        imagesJson,
        data.professional_service || false,
        data.professional_service ? new Date() : null,
        true,
      ]
    )

    const property = result.rows[0]

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error al crear propiedad:', error)
    return NextResponse.json(
      { error: 'Error al crear la propiedad' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const q = searchParams.get('q') || undefined
    const type = searchParams.get('type') || undefined
    const zone = searchParams.get('zone') || undefined
    const min = searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined
    const max = searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined
    const rooms = searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : undefined

    // Construir query
    let query = `
      SELECT 
        p.id,
        p.type,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.rooms,
        p.bathrooms,
        p.area_m2,
        p.address,
        p.image_url,
        p.images,
        p.professional_service,
        p.featured,
        p.active,
        p.views,
        p.created_at,
        z.id as zone_id,
        z.name as zone_name,
        z.slug as zone_slug
      FROM properties p
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE p.active = true
    `
    
    const params: any[] = []
    let paramCount = 0

    // Filtro por búsqueda de texto
    if (q) {
      paramCount++
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${q}%`)
    }

    // Filtro por tipo
    if (type) {
      paramCount++
      query += ` AND p.type = $${paramCount}`
      params.push(type)
    }

    // Filtro por zona
    if (zone) {
      paramCount++
      query += ` AND z.slug = $${paramCount}`
      params.push(zone)
    }

    // Filtro por precio mínimo
    if (min !== undefined) {
      paramCount++
      query += ` AND p.price >= $${paramCount}`
      params.push(min)
    }

    // Filtro por precio máximo
    if (max !== undefined) {
      paramCount++
      query += ` AND p.price <= $${paramCount}`
      params.push(max)
    }

    // Filtro por ambientes
    if (rooms !== undefined) {
      paramCount++
      query += ` AND p.rooms >= $${paramCount}`
      params.push(rooms)
    }

    // Ordenar por featured primero, luego por fecha
    query += ` ORDER BY p.featured DESC, p.professional_service DESC, p.created_at DESC`

    const result = await pool.query(query, params)

    // Transformar resultados
    const properties = result.rows.map((row: any) => {
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
        type: row.type,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price) || 0,
        currency: row.currency || 'ARS',
        rooms: row.rooms,
        bathrooms: row.bathrooms,
        area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
        address: row.address,
        image_url: row.image_url,
        images: images.length > 0 ? images : undefined,
        professional_service: row.professional_service,
        featured: row.featured || false,
        views: row.views || 0,
        created_at: row.created_at,
        zone_id: row.zone_id?.toString() || '',
        zone_name: row.zone_name,
        zone_slug: row.zone_slug,
      }
    })

    return NextResponse.json({ properties }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo propiedades:', error)
    return NextResponse.json(
      { error: 'Error al obtener propiedades' },
      { status: 500 }
    )
  }
}
