// Script para cambiar todas las rutas de /uploads/ a /images/
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixImagesToImagesFolder() {
  const client = await pool.connect()

  try {
    console.log('🖼️  Cambiando rutas de /uploads/ a /images/...\n')

    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    console.log(`📊 Total de productos a actualizar: ${result.rows.length}`)

    let actualizados = 0

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Actualizar image_url
      if (listing.image_url && listing.image_url.startsWith('/uploads/')) {
        const nombreArchivo = listing.image_url.replace('/uploads/', '')
        const nuevaRuta = `/images/${nombreArchivo}`
        
        // Verificar que existe en images
        if (fs.existsSync(`public/images/${nombreArchivo}`)) {
          nuevoImageUrl = nuevaRuta
          necesitaActualizar = true
        }
      }

      // Actualizar images array
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images)) {
            nuevasImages = images.map((img: string) => {
              if (img.startsWith('http')) {
                return img
              }
              
              if (img.startsWith('/uploads/')) {
                const nombreArchivo = img.replace('/uploads/', '')
                const nuevaRuta = `/images/${nombreArchivo}`
                
                // Verificar que existe
                if (fs.existsSync(`public/images/${nombreArchivo}`)) {
                  return nuevaRuta
                }
              }
              
              return img
            })
            
            if (JSON.stringify(nuevasImages) !== JSON.stringify(images)) {
              necesitaActualizar = true
            }
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }

      // Actualizar si es necesario
      if (necesitaActualizar) {
        await client.query(
          `UPDATE listings 
           SET image_url = $1, images = $2
           WHERE id = $3`,
          [
            nuevoImageUrl,
            nuevasImages.length > 0 ? JSON.stringify(nuevasImages) : null,
            listing.id
          ]
        )
        actualizados++
        
        if (actualizados % 50 === 0) {
          console.log(`⏳ Actualizados: ${actualizados}/${result.rows.length}`)
        }
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

fixImagesToImagesFolder()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


