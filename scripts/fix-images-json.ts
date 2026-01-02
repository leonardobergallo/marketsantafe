// Script para corregir el campo images que está guardado como string en lugar de JSON array
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixImagesJson() {
  const client = await pool.connect()

  try {
    console.log('🔧 Corrigiendo campo images (de string a JSON array)...\n')

    // Obtener todos los listings donde images es un string
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE images IS NOT NULL
    `)

    console.log(`📊 Total de productos a revisar: ${result.rows.length}`)

    let actualizados = 0

    for (const listing of result.rows) {
      try {
        // Verificar si images es un string (no JSON válido)
        let imagesArray: string[] = []
        let necesitaActualizar = false

        if (typeof listing.images === 'string') {
          // Intentar parsear como JSON
          try {
            const parsed = JSON.parse(listing.images)
            if (Array.isArray(parsed)) {
              imagesArray = parsed
            } else {
              // No es un array, crear uno con el valor
              imagesArray = [listing.images]
              necesitaActualizar = true
            }
          } catch (e) {
            // No es JSON válido, es un string simple
            // Crear array con ese string
            imagesArray = [listing.images]
            necesitaActualizar = true
          }
        } else if (Array.isArray(listing.images)) {
          imagesArray = listing.images
        }

        // Si image_url existe y no está en el array, agregarlo
        if (listing.image_url && !imagesArray.includes(listing.image_url)) {
          imagesArray.unshift(listing.image_url) // Agregar al inicio
          necesitaActualizar = true
        }

        // Si no hay imágenes pero hay image_url, usar image_url
        if (imagesArray.length === 0 && listing.image_url) {
          imagesArray = [listing.image_url]
          necesitaActualizar = true
        }

        // Actualizar si es necesario
        if (necesitaActualizar || imagesArray.length > 0) {
          await client.query(
            `UPDATE listings 
             SET images = $1
             WHERE id = $2`,
            [
              imagesArray.length > 0 ? JSON.stringify(imagesArray) : null,
              listing.id
            ]
          )
          actualizados++
          
          if (actualizados % 50 === 0) {
            console.log(`⏳ Actualizados: ${actualizados}/${result.rows.length}`)
          }
        }
      } catch (error: any) {
        console.error(`❌ Error en ${listing.title}:`, error.message)
      }
    }

    console.log(`\n✅ Productos actualizados: ${actualizados}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

fixImagesJson()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })





