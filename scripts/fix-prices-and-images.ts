// Script para corregir precios (convertir USD a ARS) y verificar rutas de imágenes
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixPricesAndImages() {
  const client = await pool.connect()

  try {
    console.log('🔧 Corrigiendo precios y verificando imágenes...')

    // Obtener todos los listings con moneda USD
    const result = await client.query(`
      SELECT id, title, price, currency, image_url, images
      FROM listings
      WHERE currency = 'USD' AND price > 0
    `)

    console.log(`📊 Productos en USD encontrados: ${result.rows.length}`)

    let actualizados = 0
    let errores = 0

    for (const listing of result.rows) {
      try {
        // Convertir precio de USD a ARS (dólar = 1500 pesos)
        const nuevoPrecio = parseFloat(listing.price) * 1500

        // Actualizar en la base de datos
        await client.query(
          `UPDATE listings 
           SET price = $1, currency = 'ARS'
           WHERE id = $2`,
          [nuevoPrecio, listing.id]
        )

        actualizados++
        console.log(`✅ ${listing.title}: ${listing.price} USD → ${nuevoPrecio.toFixed(2)} ARS`)
      } catch (error: any) {
        console.error(`❌ Error actualizando ${listing.title}:`, error.message)
        errores++
      }
    }

    console.log(`\n✅ Precios actualizados: ${actualizados}`)
    if (errores > 0) {
      console.log(`❌ Errores: ${errores}`)
    }

    // Verificar imágenes
    console.log('\n🖼️  Verificando rutas de imágenes...')
    const imagesResult = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
      LIMIT 100
    `)

    let imagenesOk = 0
    let imagenesFaltantes = 0

    for (const listing of imagesResult.rows) {
      let tieneImagen = false

      // Verificar image_url
      if (listing.image_url) {
        const ruta = listing.image_url.startsWith('/')
          ? `public${listing.image_url}`
          : `public/uploads/${listing.image_url}`
        
        if (fs.existsSync(ruta)) {
          tieneImagen = true
        } else if (listing.image_url.startsWith('http')) {
          tieneImagen = true // URL externa
        }
      }

      // Verificar images (array)
      if (!tieneImagen && listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images) && images.length > 0) {
            const primeraImagen = images[0]
            const ruta = primeraImagen.startsWith('/')
              ? `public${primeraImagen}`
              : `public/uploads/${primeraImagen}`
            
            if (fs.existsSync(ruta) || primeraImagen.startsWith('http')) {
              tieneImagen = true
            }
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }

      if (tieneImagen) {
        imagenesOk++
      } else {
        imagenesFaltantes++
        console.log(`⚠️  ${listing.title}: imagen no encontrada`)
      }
    }

    console.log(`\n✅ Imágenes OK: ${imagenesOk}`)
    console.log(`⚠️  Imágenes faltantes: ${imagenesFaltantes}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

fixPricesAndImages()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })





