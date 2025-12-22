// API route para publicar múltiples listings del mercado a la vez
// POST /api/publish/listing/bulk

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación para un listing individual
const listingSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  zoneId: z.string().min(1, 'La zona es requerida'),
  price: z.union([z.string(), z.number()]).optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional().nullable(),
  description: z.string().min(1, 'La descripción es requerida'),
  whatsapp: z.string().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  image_url: z.string().optional().nullable().or(z.literal('')),
  images: z.array(z.string()).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  instagram: z.string().optional().nullable().or(z.literal('')),
})

// Schema para el array de listings
const bulkListingSchema = z.object({
  listings: z.array(listingSchema).min(1, 'Debes incluir al menos un producto'),
  // Campos compartidos opcionales (se aplican a todos los productos si no están definidos individualmente)
  defaultWhatsapp: z.string().optional().or(z.literal('')),
  defaultPhone: z.string().optional().or(z.literal('')),
  defaultEmail: z.string().email().optional().or(z.literal('')),
  defaultInstagram: z.string().optional().or(z.literal('')),
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

    let body: any
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parseando body JSON:', error)
      return NextResponse.json(
        { error: 'Error al procesar los datos enviados. Verifica que el formato sea correcto.' },
        { status: 400 }
      )
    }

    console.log('📥 Recibidos', body.listings?.length || 0, 'listings para importar')

    // Validar datos
    const validationResult = bulkListingSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('❌ Error de validación:', {
        errors: validationResult.error.errors,
        issues: validationResult.error.issues,
        formErrors: validationResult.error.format(),
      })
      
      // Formatear errores de manera más legible
      const formattedErrors = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: formattedErrors,
          errors: formattedErrors,
          rawErrors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { listings, defaultWhatsapp, defaultPhone, defaultEmail, defaultInstagram } = validationResult.data

    // Limitar a 50 productos por request para evitar sobrecarga
    if (listings.length > 50) {
      return NextResponse.json(
        { error: 'Máximo 50 productos por carga masiva' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Procesar cada listing
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i]
      
      try {
        // Usar valores por defecto si no están definidos en el listing individual
        const whatsapp = listing.whatsapp && listing.whatsapp.trim() !== '' 
          ? listing.whatsapp 
          : (defaultWhatsapp && defaultWhatsapp.trim() !== '' ? defaultWhatsapp : null)
        
        const phone = listing.phone && listing.phone.trim() !== '' 
          ? listing.phone 
          : (defaultPhone && defaultPhone.trim() !== '' ? defaultPhone : null)
        
        const email = listing.email && listing.email.trim() !== '' 
          ? listing.email 
          : (defaultEmail && defaultEmail.trim() !== '' ? defaultEmail : null)
        
        const instagram = listing.instagram && listing.instagram.trim() !== '' 
          ? listing.instagram 
          : (defaultInstagram && defaultInstagram.trim() !== '' ? defaultInstagram : null)

        // Verificar que categoryId y zoneId sean números válidos
        const categoryIdNum = listing.categoryId === 'all' ? null : parseInt(listing.categoryId)
        const zoneIdNum = listing.zoneId === 'all' ? null : parseInt(listing.zoneId)

        if (categoryIdNum !== null && isNaN(categoryIdNum)) {
          errors.push({ index: i, title: listing.title, error: 'Categoría inválida' })
          continue
        }

        if (zoneIdNum === null || isNaN(zoneIdNum)) {
          errors.push({ index: i, title: listing.title, error: 'Zona inválida' })
          continue
        }

        // Preparar imágenes (sin límite) - puede estar vacío si el usuario subirá las fotos manualmente
        const imagesArray = listing.images && listing.images.length > 0 
          ? listing.images.filter(img => img && img.trim() !== '')
          : (listing.image_url ? [listing.image_url] : [])
        
        const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null // Puede ser null si no hay imágenes

        // Insertar listing
        const result = await pool.query(
          `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id, title, created_at`,
          [
            user.id,
            categoryIdNum,
            zoneIdNum,
            listing.title,
            listing.description,
            typeof listing.price === 'number' ? listing.price : (listing.price ? parseFloat(String(listing.price)) : 0),
            listing.currency || 'ARS',
            listing.condition || null,
            whatsapp,
            phone,
            email,
            instagram,
            primaryImage,
            JSON.stringify(imagesArray),
            true,
          ]
        )

        results.push({
          index: i,
          listing: {
            id: result.rows[0].id,
            title: result.rows[0].title,
            created_at: result.rows[0].created_at,
          },
        })
      } catch (error) {
        console.error(`Error al publicar listing ${i + 1}:`, error)
        errors.push({ 
          index: i, 
          title: listing.title || `Producto ${i + 1}`, 
          error: 'Error al crear la publicación' 
        })
      }
    }

    return NextResponse.json(
      {
        message: `Publicación masiva completada: ${results.length} exitosos, ${errors.length} con errores`,
        success: results.length,
        errors: errors.length,
        results: results,
        errorsDetails: errors,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error al publicar listings masivamente:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Error al crear las publicaciones',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

