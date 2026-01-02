// API route para importar propiedades desde Excel
// POST /api/properties/import-excel

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'
import * as XLSX from 'xlsx'
import { z } from 'zod'

// Función para convertir nombre de archivo a URL
function getImageUrl(filename: string | undefined | null): string | null {
  if (!filename || filename.trim() === '') {
    return null
  }

  const trimmed = filename.trim()

  // Si ya es una URL completa (http/https), devolverla tal cual
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Si es un nombre de archivo, buscar en public/uploads/
  return `/uploads/${trimmed}`
}

// Función para procesar imágenes desde las columnas del Excel
function processImages(row: any): string[] {
  const images: string[] = []

  // Procesar foto_principal (opcional)
  if (row.foto_principal) {
    const url = getImageUrl(row.foto_principal)
    if (url) {
      images.push(url)
    }
  }

  // Procesar foto_2, foto_3, foto_4, etc. (opcionales, hasta 10)
  const additionalPhotos = [
    row.foto_2,
    row.foto_3,
    row.foto_4,
    row.foto_5,
    row.foto_6,
    row.foto_7,
    row.foto_8,
    row.foto_9,
    row.foto_10,
  ].filter(Boolean)

  for (const photo of additionalPhotos) {
    const url = getImageUrl(photo)
    if (url && !images.includes(url) && images.length < 10) {
      images.push(url)
    }
  }

  return images
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para importar' },
        { status: 401 }
      )
    }

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Verificar que sea un archivo Excel o CSV
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx, .xls) o CSV' },
        { status: 400 }
      )
    }

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío' },
        { status: 400 }
      )
    }

    // Validar columnas requeridas
    const requiredColumns = ['titulo', 'tipo', 'zona', 'descripcion', 'precio']
    const firstRow = data[0] as any
    const missingColumns = requiredColumns.filter(
      col => !(col in firstRow)
    )

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
          requiredColumns: ['titulo', 'tipo', 'zona', 'descripcion', 'precio', 'ambientes (opcional)', 'baños (opcional)', 'superficie (opcional)', 'direccion (opcional)', 'foto_principal (opcional)'],
        },
        { status: 400 }
      )
    }

    // Procesar cada fila
    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string }>,
      properties: [] as Array<{ id: number; title: string }>,
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // +2 porque Excel empieza en 1 y tiene header

      try {
        // Validar datos básicos
        if (!row.titulo || !row.titulo.trim()) {
          results.errors.push({ row: rowNumber, error: 'Título vacío' })
          continue
        }

        if (!row.descripcion || !row.descripcion.trim()) {
          results.errors.push({ row: rowNumber, error: 'Descripción vacía' })
          continue
        }

        // Validar tipo
        const tipo = String(row.tipo).toLowerCase().trim()
        if (!['alquiler', 'venta', 'alquiler-temporal'].includes(tipo)) {
          results.errors.push({ 
            row: rowNumber, 
            error: `Tipo inválido: ${row.tipo}. Debe ser: alquiler, venta o alquiler-temporal` 
          })
          continue
        }

        // Buscar zona (puede ser ID, nombre o slug)
        // Si no existe, crearla automáticamente
        let zoneId: number | null = null
        if (row.zona) {
          const zoneQuery = /^\d+$/.test(String(row.zona))
            ? 'SELECT id FROM zones WHERE id = $1'
            : 'SELECT id FROM zones WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1'
          
          const zoneResult = await pool.query(zoneQuery, [row.zona])
          if (zoneResult.rows.length > 0) {
            zoneId = zoneResult.rows[0].id
          } else {
            // Si no existe, crear la zona automáticamente
            const zoneName = String(row.zona).trim()
            const zoneSlug = zoneName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
            
            const newZoneResult = await pool.query(
              'INSERT INTO zones (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
              [zoneName, zoneSlug]
            )
            zoneId = newZoneResult.rows[0].id
          }
        }

        if (!zoneId) {
          results.errors.push({ row: rowNumber, error: `Zona no encontrada: ${row.zona}` })
          continue
        }

        // Procesar precio
        let price = 0
        let currency = 'ARS'
        
        if (row.precio) {
          const priceStr = String(row.precio).replace(/[^\d.,]/g, '').replace(',', '.')
          price = parseFloat(priceStr) || 0
        }

        if (price <= 0) {
          results.errors.push({ row: rowNumber, error: 'El precio debe ser mayor a 0' })
          continue
        }

        // Moneda (opcional, default ARS)
        if (row.moneda) {
          const moneda = String(row.moneda).toUpperCase().trim()
          if (moneda === 'USD' || moneda === 'ARS') {
            currency = moneda
          }
        }

        // Procesar campos opcionales
        const rooms = row.ambientes ? parseInt(String(row.ambientes)) : null
        const bathrooms = row.banos || row.bathrooms ? parseInt(String(row.banos || row.bathrooms)) : null
        const area_m2 = row.superficie || row.area_m2 ? parseFloat(String(row.superficie || row.area_m2)) : null
        const address = row.direccion || row.address ? String(row.direccion || row.address).trim() : null

        // Procesar imágenes
        const images = processImages(row)
        const primaryImage = images.length > 0 ? images[0] : null
        const imagesJson = images.length > 0 ? JSON.stringify(images) : null

        // Procesar contacto (opcional)
        const whatsapp = row.whatsapp && String(row.whatsapp).trim() !== '' ? String(row.whatsapp).trim() : null
        const phone = row.telefono && String(row.telefono).trim() !== '' ? String(row.telefono).trim() : null
        const email = row.email && String(row.email).trim() !== '' ? String(row.email).trim() : null
        const instagram = row.instagram && String(row.instagram).trim() !== '' ? String(row.instagram).trim() : null

        // Servicio profesional (opcional, default false)
        const professional_service = row.servicio_profesional 
          ? String(row.servicio_profesional).toLowerCase().trim() === 'si' || 
            String(row.servicio_profesional).toLowerCase().trim() === 'true' ||
            String(row.servicio_profesional).toLowerCase().trim() === '1'
          : false

        // Verificar límite de propiedades (una por una)
        // NOTA: Para importación masiva, omitimos la verificación de límites
        // Si se necesita, se puede habilitar descomentando el código siguiente:
        /*
        const limitCheck = await checkCanPublish(user.id, 'property')
        if (!limitCheck.allowed) {
          throw new Error(
            limitCheck.reason === 'limit_reached'
              ? `Límite de propiedades alcanzado (${limitCheck.current}/${limitCheck.limit}). Actualizá tu plan para publicar más.`
              : 'No podés publicar. Verificá tu suscripción.'
          )
        }
        */

        // Insertar propiedad
        const result = await pool.query(
          `INSERT INTO properties (
            user_id, type, title, description, price, currency,
            zone_id, rooms, bathrooms, area_m2, address,
            phone, whatsapp, email, instagram,
            image_url, images, professional_service, professional_service_requested_at, active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING id, title, created_at`,
          [
            user.id,
            tipo,
            String(row.titulo).trim(),
            String(row.descripcion).trim(),
            price,
            currency,
            zoneId,
            rooms,
            bathrooms,
            area_m2,
            address,
            phone,
            whatsapp,
            email,
            instagram,
            primaryImage,
            imagesJson,
            professional_service,
            professional_service ? new Date() : null,
            true,
          ]
        )

        const property = result.rows[0]
        results.success++
        results.properties.push({
          id: property.id,
          title: property.title,
        })
      } catch (error: any) {
        console.error(`Error procesando fila ${rowNumber}:`, error)
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Error desconocido',
        })
      }
    }

    return NextResponse.json(
      {
        message: `Importación completada: ${results.success} propiedades creadas`,
        success: results.success,
        errors: results.errors,
        properties: results.properties,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error al importar Excel:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo Excel', details: error.message },
      { status: 500 }
    )
  }
}

