// Script para cambiar todas las rutas de /images/ a /uploads/images/
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixPathsToUploadsImages() {
  const client = await pool.connect()

  try {
    console.log('🖼️  Cambiando rutas de /images/ a /uploads/images/...\n')

    const uploadsImagesDir = 'public/uploads/images'
    
    if (!fs.existsSync(uploadsImagesDir)) {
      console.error('❌ La carpeta public/uploads/images no existe!')
      process.exit(1)
    }

    const allImages = new Set(fs.readdirSync(uploadsImagesDir).filter(f => 
      f.match(/\.(png|jpg|jpeg|gif|webp)$/i)
    ))

    console.log(`📊 Total de imágenes en uploads/images: ${allImages.size}`)

    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    console.log(`📦 Total de productos: ${result.rows.length}\n`)

    let actualizados = 0

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Actualizar image_url
      if (listing.image_url && listing.image_url.startsWith('/images/')) {
        const nombreArchivo = listing.image_url.replace('/images/', '')
        const nuevaRuta = `/uploads/images/${nombreArchivo}`
        
        // Verificar que existe en uploads/images
        if (allImages.has(nombreArchivo)) {
          nuevoImageUrl = nuevaRuta
          necesitaActualizar = true
        } else {
          console.log(`⚠️  ${listing.title.substring(0, 40)}: Imagen no encontrada - ${nombreArchivo.substring(0, 30)}`)
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
              if (img.startsWith('http')) return img
              
              if (img.startsWith('/images/')) {
                const nombreArchivo = img.replace('/images/', '')
                if (allImages.has(nombreArchivo)) {
                  return `/uploads/images/${nombreArchivo}`
                }
              }
              
              return img
            }).filter(Boolean)
            
            if (JSON.stringify(nuevasImages) !== JSON.stringify(images)) {
              necesitaActualizar = true
            }
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }

      // Si no hay imágenes en el array pero hay image_url, crear array
      if (nuevasImages.length === 0 && nuevoImageUrl && nuevoImageUrl.startsWith('/uploads/images/')) {
        nuevasImages = [nuevoImageUrl]
        necesitaActualizar = true
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

fixPathsToUploadsImages()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


