// Script para importar productos desde Excel directamente a la base de datos
import { config } from 'dotenv'
import { resolve } from 'path'
import * as XLSX from 'xlsx'
import { pool } from '../lib/db'

config({ path: resolve(process.cwd(), '.env.local') })

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

  // Procesar foto_principal
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

async function importExcelProducts() {
  const client = await pool.connect()

  try {
    console.log('📦 Iniciando importación de productos desde Excel...')

    // Leer el Excel
    const excelPath = 'productos-exportados-2025-12-28T13-23-45.xlsx'
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`📊 Total de productos a importar: ${data.length}`)

    // Obtener usuario por defecto (necesitas tener un usuario en la BD)
    // Por ahora usaremos el primer usuario o puedes especificar un ID
    const userResult = await client.query('SELECT id FROM users LIMIT 1')
    if (userResult.rows.length === 0) {
      console.error('❌ No hay usuarios en la base de datos. Crea un usuario primero.')
      process.exit(1)
    }
    const userId = userResult.rows[0].id
    console.log(`👤 Usando usuario ID: ${userId}`)

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
          
          const categoryResult = await client.query(categoryQuery, [row.categoria])
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
          
          const zoneResult = await client.query(zoneQuery, [row.zona])
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
        const result = await client.query(
          `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id, title, created_at`,
          [
            userId,
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

        // Mostrar progreso cada 100 productos
        if ((i + 1) % 100 === 0) {
          console.log(`⏳ Procesados: ${i + 1}/${data.length} (${results.success} exitosos, ${results.errors.length} errores)`)
        }
      } catch (error: any) {
        console.error(`Error procesando fila ${rowNumber}:`, error.message)
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Error desconocido',
        })
      }
    }

    console.log('\n🎉 Importación completada!')
    console.log(`✅ Productos creados: ${results.success}`)
    console.log(`❌ Errores: ${results.errors.length}`)
    
    if (results.errors.length > 0 && results.errors.length <= 20) {
      console.log('\nErrores encontrados:')
      results.errors.forEach(err => {
        console.log(`  Fila ${err.row}: ${err.error}`)
      })
    } else if (results.errors.length > 20) {
      console.log(`\nPrimeros 20 errores:`)
      results.errors.slice(0, 20).forEach(err => {
        console.log(`  Fila ${err.row}: ${err.error}`)
      })
    }

  } catch (error: any) {
    console.error('❌ Error al importar:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar importación
importExcelProducts()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

