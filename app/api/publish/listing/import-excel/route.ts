// API route para importar listings desde un archivo Excel
// POST /api/publish/listing/import-excel

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import * as XLSX from 'xlsx'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'

// Mapeo de nombres de categorías a IDs
const categoryMap = new Map(
  categories.map((cat) => [cat.name.toLowerCase(), cat.id])
)

// Mapeo de nombres de zonas a IDs
const zoneMap = new Map(
  zones.map((zone) => [zone.name.toLowerCase(), zone.id])
)

function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

function parseExcelFile(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })
  return data
}

function validateAndTransformRow(row: any, index: number): { valid: boolean; data?: any; errors: string[] } {
  const errors: string[] = []
  
  // Campos obligatorios
  const title = row.titulo || row.title || ''
  const categoryName = row.categoria || row.category || ''
  const zoneName = row.zona || row.zone || ''
  const description = row.descripcion || row.description || ''

  // Validaciones
  if (!title || title.trim().length < 5) {
    errors.push('Título debe tener al menos 5 caracteres')
  }

  if (!categoryName) {
    errors.push('Categoría es requerida')
  } else {
    const categoryId = categoryMap.get(normalizeString(categoryName))
    if (!categoryId) {
      errors.push(`Categoría "${categoryName}" no es válida. Usa: ${categories.map(c => c.name).join(', ')}`)
    }
  }

  if (!zoneName) {
    errors.push('Zona es requerida')
  } else {
    const zoneId = zoneMap.get(normalizeString(zoneName))
    if (!zoneId) {
      errors.push(`Zona "${zoneName}" no es válida. Usa: ${zones.map(z => z.name).join(', ')}`)
    }
  }

  if (!description || description.trim().length < 10) {
    errors.push('Descripción debe tener al menos 10 caracteres')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  // Recopilar imágenes (imagen1, imagen2, etc.)
  const images: string[] = []
  for (let i = 1; i <= 5; i++) {
    const imgKey = `imagen${i}` || `image${i}`
    const img = row[`imagen${i}`] || row[`image${i}`]
    if (img && img.trim() !== '') {
      images.push(img.trim())
    }
  }

  // Transformar datos
  const categoryId = categoryMap.get(normalizeString(categoryName))!
  const zoneId = zoneMap.get(normalizeString(zoneName))!

  const transformedData = {
    title: title.trim(),
    categoryId,
    zoneId,
    price: row.precio || row.price ? String(row.precio || row.price).trim() : undefined,
    currency: (row.moneda || row.currency || 'ARS').toUpperCase() === 'USD' ? 'USD' : 'ARS',
    condition: row.condicion || row.condition || undefined,
    description: description.trim(),
    whatsapp: row.whatsapp ? String(row.whatsapp).trim() : undefined,
    phone: row.telefono || row.phone ? String(row.telefono || row.phone).trim() : undefined,
    email: row.email ? String(row.email).trim() : undefined,
    instagram: row.instagram ? String(row.instagram).trim().replace(/^@/, '') : undefined,
    images: images.length > 0 ? images : undefined,
  }

  // Validar condición
  if (transformedData.condition) {
    const validConditions = ['nuevo', 'usado', 'reacondicionado']
    if (!validConditions.includes(transformedData.condition.toLowerCase())) {
      transformedData.condition = undefined
    }
  }

  return { valid: true, data: transformedData, errors: [] }
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Formato de archivo no válido. Usa Excel (.xlsx, .xls) o CSV (.csv)' },
        { status: 400 }
      )
    }

    // Leer archivo
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parsear Excel
    let rows: any[]
    try {
      rows = parseExcelFile(buffer)
    } catch (error) {
      console.error('Error al parsear Excel:', error)
      return NextResponse.json(
        { error: 'Error al leer el archivo Excel. Verifica que el formato sea correcto.' },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío' },
        { status: 400 }
      )
    }

    // Limitar a 50 productos
    if (rows.length > 50) {
      return NextResponse.json(
        { error: `Máximo 50 productos por importación. Tu archivo tiene ${rows.length} filas.` },
        { status: 400 }
      )
    }

    // Campos de contacto compartidos (opcionales)
    const defaultWhatsapp = formData.get('defaultWhatsapp')?.toString() || undefined
    const defaultPhone = formData.get('defaultPhone')?.toString() || undefined
    const defaultEmail = formData.get('defaultEmail')?.toString() || undefined
    const defaultInstagram = formData.get('defaultInstagram')?.toString() || undefined

    // Validar y transformar cada fila
    const validListings: any[] = []
    const errors: { row: number; errors: string[] }[] = []

    rows.forEach((row, index) => {
      const result = validateAndTransformRow(row, index + 2) // +2 porque index es 0-based y la fila 1 es el header
      
      if (result.valid && result.data) {
        // Aplicar contactos por defecto si no están definidos
        const listing = {
          ...result.data,
          whatsapp: result.data.whatsapp || (defaultWhatsapp && defaultWhatsapp.trim() !== '' ? defaultWhatsapp : undefined),
          phone: result.data.phone || (defaultPhone && defaultPhone.trim() !== '' ? defaultPhone : undefined),
          email: result.data.email || (defaultEmail && defaultEmail.trim() !== '' ? defaultEmail : undefined),
          instagram: result.data.instagram || (defaultInstagram && defaultInstagram.trim() !== '' ? defaultInstagram : undefined),
        }
        validListings.push(listing)
      } else {
        errors.push({ row: index + 2, errors: result.errors })
      }
    })

    if (validListings.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se encontraron productos válidos en el archivo',
          errors,
        },
        { status: 400 }
      )
    }

    // Insertar listings en la base de datos
    const results = []
    const insertErrors = []

    for (let i = 0; i < validListings.length; i++) {
      const listing = validListings[i]
      
      try {
        // Preparar imágenes
        const imagesArray = listing.images && listing.images.length > 0 
          ? listing.images.slice(0, 5).filter(img => img && img.trim() !== '')
          : []
        
        const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null

        // Insertar listing
        const result = await pool.query(
          `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id, title, created_at`,
          [
            user.id,
            parseInt(listing.categoryId),
            parseInt(listing.zoneId),
            listing.title,
            listing.description,
            listing.price ? parseFloat(listing.price) : 0,
            listing.currency || 'ARS',
            listing.condition || null,
            listing.whatsapp || null,
            listing.phone || null,
            listing.email || null,
            listing.instagram || null,
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
        console.error(`Error al insertar listing ${i + 1}:`, error)
        insertErrors.push({ 
          index: i, 
          title: listing.title || `Producto ${i + 1}`, 
          error: 'Error al crear la publicación' 
        })
      }
    }

    return NextResponse.json(
      {
        message: `Importación completada: ${results.length} exitosos, ${errors.length + insertErrors.length} con errores`,
        success: results.length,
        validationErrors: errors.length,
        insertErrors: insertErrors.length,
        totalErrors: errors.length + insertErrors.length,
        results: results,
        validationErrorsDetails: errors,
        insertErrorsDetails: insertErrors,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al importar desde Excel:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo Excel' },
      { status: 500 }
    )
  }
}


