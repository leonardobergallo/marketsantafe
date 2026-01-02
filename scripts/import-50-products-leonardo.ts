// Script para importar 50 productos desde Excel para Leonardo
import { config } from 'dotenv'
import { resolve } from 'path'
import * as XLSX from 'xlsx'
import { pool } from '../lib/db'
import * as fs from 'fs'

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
  // Verificar que el archivo existe
  const filePath = `public/uploads/${trimmed}`
  if (fs.existsSync(filePath)) {
    return `/uploads/${trimmed}`
  }

  return null
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

async function import50ProductsLeonardo() {
  const client = await pool.connect()

  try {
    console.log('📦 Iniciando importación de productos desde Excel para Leonardo...\n')

    // Buscar usuario Leonardo (usar el primero que encuentre)
    const userResult = await client.query(
      "SELECT id, name, email FROM users WHERE email ILIKE '%leonardo%' OR name ILIKE '%leonardo%' ORDER BY id LIMIT 1"
    )

    if (userResult.rows.length === 0) {
      console.error('❌ No se encontró usuario de Leonardo')
      console.error('   Buscando todos los usuarios...')
      const allUsers = await client.query('SELECT id, name, email FROM users ORDER BY id')
      allUsers.rows.forEach((u: any) => {
        console.log(`   ID: ${u.id} | ${u.name} | ${u.email}`)
      })
      process.exit(1)
    }

    const user = userResult.rows[0]
    const userId = user.id
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`)
    console.log(`   ID: ${userId}\n`)

    // Leer el Excel
    const excelPath = 'productos-exportados-2025-12-28T13-23-45.xlsx'
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ No se encontró el archivo Excel: ${excelPath}`)
      process.exit(1)
    }

    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`📊 Total de productos en Excel: ${data.length}`)
    console.log(`📊 Importando todos los productos (multiplicando precios por 1530)\n`)

    // Importar todos los productos
    const productsToImport = data

    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string }>,
      listings: [] as Array<{ id: number; title: string }>,
    }

    for (let i = 0; i < productsToImport.length; i++) {
      const row = productsToImport[i] as any
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
            // Si no existe, crear la zona automáticamente
            const zoneName = String(row.zona).trim()
            const zoneSlug = zoneName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
            
            const newZoneResult = await client.query(
              'INSERT INTO zones (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
              [zoneName, zoneSlug]
            )
            zoneId = newZoneResult.rows[0].id
          }
        }

        if (!zoneId) {
          results.errors.push({ row: rowNumber, error: 'Zona es requerida' })
          continue
        }

        // Procesar precio - multiplicar por 1530 (valor del dólar)
        let price = 0
        let currency = 'ARS'
        
        if (row.precio) {
          const priceStr = String(row.precio).replace(/[^\d.,]/g, '').replace(',', '.')
          const basePrice = parseFloat(priceStr) || 0
          
          // Multiplicar por 1530 (valor del dólar)
          if (basePrice > 0) {
            price = basePrice * 1530
          }
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

        // Procesar condición
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
        const imagesJson = images.length > 0 ? JSON.stringify(images) : null

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
            imagesJson,
            true,
          ]
        )

        const listing = result.rows[0]
        results.success++
        results.listings.push({
          id: listing.id,
          title: listing.title,
        })

        // Mostrar progreso cada 50 productos
        if ((i + 1) % 50 === 0) {
          console.log(`⏳ Procesados: ${i + 1}/${productsToImport.length} (${results.success} exitosos, ${results.errors.length} errores)`)
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
    
    if (results.errors.length > 0) {
      console.log('\nErrores encontrados:')
      results.errors.forEach(err => {
        console.log(`  Fila ${err.row}: ${err.error}`)
      })
    }

    if (results.success > 0) {
      console.log('\n✅ Productos importados exitosamente para:', user.name)
      console.log(`   Total: ${results.success} productos`)
    }

  } catch (error: any) {
    console.error('❌ Error al importar:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar importación
import50ProductsLeonardo()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

