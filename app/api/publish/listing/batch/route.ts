// API route para publicar múltiples listings del mercado
// POST /api/publish/listing/batch

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'
import { z } from 'zod'

// Schema de validación para un producto
const productSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  zoneId: z.string().min(1, 'La zona es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.string().optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional(),
  images: z.array(z.string()).optional().default([]),
  whatsapp: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
})

// Schema para el body completo
const batchSchema = z.object({
  products: z.array(productSchema).min(1, 'Debes incluir al menos un producto'),
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

    const { products, globalContact = {} } = validationResult.data

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

    // Verificar que no exceda el límite
    const currentCount = limitCheck.current || 0
    const limit = limitCheck.limit || 0
    if (limit !== -1 && currentCount + products.length > limit) {
      return NextResponse.json(
        { 
          error: 'Excederías tu límite de publicaciones',
          current: currentCount,
          limit: limit,
          tryingToAdd: products.length,
          message: `Tenés ${currentCount}/${limit} publicaciones. Estás intentando agregar ${products.length} más, pero solo podés agregar ${limit - currentCount}.`
        },
        { status: 403 }
      )
    }

    // Obtener tienda del usuario si existe
    let storeId: number | null = null
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE user_id = $1 AND active = true',
      [user.id]
    )
    if (storeResult.rows.length > 0) {
      storeId = storeResult.rows[0].id
    }

    const results = {
      success: 0,
      errors: [] as Array<{ index: number; title: string; error: string }>,
      listings: [] as Array<{ id: number; title: string }>,
    }

    // Procesar cada producto
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      try {
        // Aplicar contacto global si el producto no tiene contacto individual
        const whatsapp = product.whatsapp?.trim() || globalContact.whatsapp?.trim() || null
        const phone = product.phone?.trim() || globalContact.phone?.trim() || null
        const email = product.email?.trim() || globalContact.email?.trim() || null
        const instagram = product.instagram?.trim() || globalContact.instagram?.trim() || null

        // Verificar que categoryId y zoneId sean números válidos
        const categoryIdNum = product.categoryId === 'all' ? null : parseInt(product.categoryId)
        const zoneIdNum = product.zoneId === 'all' ? null : parseInt(product.zoneId)

        if (categoryIdNum !== null && isNaN(categoryIdNum)) {
          results.errors.push({
            index: i + 1,
            title: product.title || `Producto ${i + 1}`,
            error: 'Categoría inválida'
          })
          continue
        }

        if (zoneIdNum === null || isNaN(zoneIdNum)) {
          results.errors.push({
            index: i + 1,
            title: product.title || `Producto ${i + 1}`,
            error: 'Zona inválida'
          })
          continue
        }

        // Preparar imágenes (máximo 5)
        const imagesArray = product.images && product.images.length > 0
          ? product.images.slice(0, 5).filter(img => img && img.trim() !== '')
          : []
        
        const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null

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
            product.title,
            product.description,
            product.price ? parseFloat(product.price) : 0,
            product.currency || 'ARS',
            product.condition || null,
            whatsapp,
            phone,
            email,
            instagram,
            primaryImage,
            JSON.stringify(imagesArray),
            true,
          ]
        )

        const listing = result.rows[0]
        results.success++
        results.listings.push({
          id: listing.id,
          title: listing.title,
        })
      } catch (error: any) {
        console.error(`Error al crear producto ${i + 1}:`, error)
        results.errors.push({
          index: i + 1,
          title: product.title || `Producto ${i + 1}`,
          error: error.message || 'Error desconocido al crear el producto'
        })
      }
    }

    return NextResponse.json(
      {
        message: `Publicación masiva completada: ${results.success} productos creados${results.errors.length > 0 ? `, ${results.errors.length} errores` : ''}`,
        success: results.success,
        errors: results.errors,
        listings: results.listings,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al publicar listings en lote:', error)
    return NextResponse.json(
      { error: 'Error al crear las publicaciones' },
      { status: 500 }
    )
  }
}
