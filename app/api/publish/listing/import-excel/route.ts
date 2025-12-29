// API route para importar listings desde Excel
// POST /api/publish/listing/import-excel

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
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

  // Si es un nombre de archivo, buscar primero en public/uploads/, luego en public/images/
  // En producción, las imágenes en public/ se sirven desde la raíz
  // Intentamos primero en uploads (preferido), luego en images (fallback)
  return `/uploads/${trimmed}`
}

// Función para procesar imágenes desde las columnas del Excel
function processImages(row: any): string[] {
  const images: string[] = []

  // Procesar foto_principal (obligatoria)
  if (row.foto_principal) {
    const url = getImageUrl(row.foto_principal)
    if (url) {
      images.push(url)
    }
  }

  // Procesar foto_2, foto_3, foto_4 (opcionales)
  const additionalPhotos = [
    row.foto_2,
    row.foto_3,
    row.foto_4,
  ].filter(Boolean)

  for (const photo of additionalPhotos) {
    const url = getImageUrl(photo)
    if (url && !images.includes(url)) {
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

    // Verificar que sea un archivo Excel
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
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
        { error: 'El Excel está vacío' },
        { status: 400 }
      )
    }

    // Validar columnas requeridas
    const requiredColumns = ['titulo', 'categoria', 'zona', 'descripcion']
    const firstRow = data[0] as any
    const missingColumns = requiredColumns.filter(
      col => !(col in firstRow)
    )

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
          requiredColumns: ['titulo', 'categoria', 'zona', 'descripcion', 'precio (opcional)', 'foto_principal (opcional)'],
        },
        { status: 400 }
      )
    }

    // Procesar cada fila
    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string }>,
      listings: [] as Array<{ id: number; title: string }>,
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

        // Buscar categoría (puede ser ID, nombre o slug)
        let categoryId: number | null = null
        if (row.categoria) {
          const categoryQuery = /^\d+$/.test(String(row.categoria))
            ? 'SELECT id FROM categories WHERE id = $1'
            : 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1'
          
          const categoryResult = await pool.query(categoryQuery, [row.categoria])
          if (categoryResult.rows.length > 0) {
            categoryId = categoryResult.rows[0].id
          } else {
            results.errors.push({ row: rowNumber, error: `Categoría no encontrada: ${row.categoria}` })
            continue
          }
        }

        // Buscar zona (puede ser ID, nombre o slug)
        let zoneId: number | null = null
        if (row.zona) {
          const zoneQuery = /^\d+$/.test(String(row.zona))
            ? 'SELECT id FROM zones WHERE id = $1'
            : 'SELECT id FROM zones WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1'
          
          const zoneResult = await pool.query(zoneQuery, [row.zona])
          if (zoneResult.rows.length > 0) {
            zoneId = zoneResult.rows[0].id
          } else {
            results.errors.push({ row: rowNumber, error: `Zona no encontrada: ${row.zona}` })
            continue
          }
        }

        if (!zoneId) {
          results.errors.push({ row: rowNumber, error: 'Zona es requerida' })
          continue
        }

        // Procesar precio - multiplicar por 1500 para obtener precio en pesos
        let price = 0
        let currency = 'ARS'
        
        if (row.precio) {
          const priceStr = String(row.precio).replace(/[^\d.,]/g, '').replace(',', '.')
          price = parseFloat(priceStr) || 0
          
          // Multiplicar por 1500 para obtener el precio correcto en pesos
          if (price > 0) {
            price = price * 1500
          }
        }

        // Procesar condición (acepta mayúsculas/minúsculas)
        let condition: 'nuevo' | 'usado' | 'reacondicionado' | null = null
        if (row.condicion) {
          const cond = String(row.condicion).toLowerCase().trim()
          if (cond === 'nuevo' || cond === 'usado' || cond === 'reacondicionado') {
            condition = cond as 'nuevo' | 'usado' | 'reacondicionado'
          }
        }

        // Procesar imágenes
        const images = processImages(row)
        const primaryImage = images.length > 0 ? images[0] : null

        // Procesar contacto
        const whatsapp = row.whatsapp && String(row.whatsapp).trim() !== '' ? String(row.whatsapp).trim() : null
        const phone = row.telefono && String(row.telefono).trim() !== '' ? String(row.telefono).trim() : null
        const email = row.email && String(row.email).trim() !== '' ? String(row.email).trim() : null
        const instagram = row.instagram && String(row.instagram).trim() !== '' ? String(row.instagram).trim() : null

        // Insertar listing
        const result = await pool.query(
          `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id, title, created_at`,
          [
            user.id,
            categoryId,
            zoneId,
            String(row.titulo).trim(),
            String(row.descripcion).trim(),
            price,
            currency,
            condition,
            whatsapp,
            phone,
            email,
            instagram,
            primaryImage,
            JSON.stringify(images),
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
        console.error(`Error procesando fila ${rowNumber}:`, error)
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Error desconocido',
        })
      }
    }

    return NextResponse.json(
      {
        message: `Importación completada: ${results.success} productos creados`,
        success: results.success,
        errors: results.errors,
        listings: results.listings,
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

