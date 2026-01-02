// API route para publicar múltiples propiedades
// POST /api/properties/batch

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'
import { z } from 'zod'

// Schema de validación para una propiedad
const propertySchema = z.object({
  type: z.enum(['alquiler', 'venta', 'alquiler-temporal']),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede tener más de 200 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000, 'La descripción no puede tener más de 2000 caracteres'),
  price: z.string().min(1, 'El precio es requerido'),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  zone_id: z.string().min(1, 'La zona es requerida'),
  rooms: z.string().optional().or(z.literal('')),
  bathrooms: z.string().optional().or(z.literal('')),
  area_m2: z.string().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  whatsapp: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  professional_service: z.boolean().optional().default(false),
})

// Schema para el body completo
const batchSchema = z.object({
  properties: z.array(propertySchema).min(1, 'Debes incluir al menos una propiedad'),
  globalContact: z.object({
    whatsapp: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
  }).optional(),
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
    const validationResult = batchSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { properties, globalContact = {} } = validationResult.data

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

    // Verificar que no exceda el límite
    const currentCount = limitCheck.current || 0
    const limit = limitCheck.limit || 0
    if (limit !== -1 && currentCount + properties.length > limit) {
      return NextResponse.json(
        { 
          error: 'Excederías tu límite de propiedades',
          current: currentCount,
          limit: limit,
          tryingToAdd: properties.length,
          message: `Tenés ${currentCount}/${limit} propiedades. Estás intentando agregar ${properties.length} más, pero solo podés agregar ${limit - currentCount}.`
        },
        { status: 403 }
      )
    }

    const results = {
      success: 0,
      errors: [] as Array<{ index: number; title: string; error: string }>,
      properties: [] as Array<{ id: number; title: string }>,
    }

    // Procesar cada propiedad
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      
      try {
        // Aplicar contacto global si la propiedad no tiene contacto individual
        const whatsapp = property.whatsapp?.trim() || globalContact.whatsapp?.trim() || null
        const phone = property.phone?.trim() || globalContact.phone?.trim() || null
        const email = property.email?.trim() || globalContact.email?.trim() || null
        const instagram = property.instagram?.trim() || globalContact.instagram?.trim() || null

        // Validar zone_id
        const zoneId = property.zone_id === 'all' ? null : parseInt(property.zone_id)
        if (!zoneId || isNaN(zoneId)) {
          results.errors.push({
            index: i + 1,
            title: property.title || `Propiedad ${i + 1}`,
            error: 'Zona inválida'
          })
          continue
        }

        // Preparar imágenes (máximo 10 para propiedades)
        const imagesArray = property.images && property.images.length > 0
          ? property.images.slice(0, 10).filter(img => img && img.trim() !== '')
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
          RETURNING id, title, created_at`,
          [
            user.id,
            property.type,
            property.title,
            property.description,
            parseFloat(property.price),
            property.currency || 'ARS',
            zoneId,
            property.rooms ? parseInt(property.rooms) : null,
            property.bathrooms ? parseInt(property.bathrooms) : null,
            property.area_m2 ? parseFloat(property.area_m2) : null,
            property.address?.trim() || null,
            property.latitude || null,
            property.longitude || null,
            phone,
            whatsapp,
            email,
            instagram,
            primaryImage,
            imagesJson,
            property.professional_service || false,
            property.professional_service ? new Date() : null,
            true,
          ]
        )

        const prop = result.rows[0]
        results.success++
        results.properties.push({
          id: prop.id,
          title: prop.title,
        })
      } catch (error: any) {
        console.error(`Error al crear propiedad ${i + 1}:`, error)
        results.errors.push({
          index: i + 1,
          title: property.title || `Propiedad ${i + 1}`,
          error: error.message || 'Error desconocido al crear la propiedad'
        })
      }
    }

    return NextResponse.json(
      {
        message: `Publicación masiva completada: ${results.success} propiedades creadas${results.errors.length > 0 ? `, ${results.errors.length} errores` : ''}`,
        success: results.success,
        errors: results.errors,
        properties: results.properties,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al publicar propiedades en lote:', error)
    return NextResponse.json(
      { error: 'Error al crear las propiedades' },
      { status: 500 }
    )
  }
}
