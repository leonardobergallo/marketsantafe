// Script para corregir las rutas de imágenes de /uploads/images/ a /uploads/
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function fixImagePathsToUploads() {
  const client = await pool.connect()

  try {
    console.log('🔧 Corrigiendo rutas de imágenes de /uploads/images/ a /uploads/...\n')

    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    console.log(`📊 Total de productos: ${result.rows.length}`)

    let actualizados = 0
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Corregir image_url
      if (listing.image_url && listing.image_url.startsWith('/uploads/images/')) {
        const nombreArchivo = listing.image_url.replace('/uploads/images/', '')
        const nuevaRuta = `/uploads/${nombreArchivo}`
        
        // Verificar que existe en uploads/
        const rutaCompleta = path.join(uploadsDir, nombreArchivo)
        if (fs.existsSync(rutaCompleta)) {
          nuevoImageUrl = nuevaRuta
          necesitaActualizar = true
        } else {
          console.log(`⚠️  ${listing.title.substring(0, 40)}: Imagen no encontrada - ${nombreArchivo.substring(0, 30)}`)
        }
      }

      // Corregir images array
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images)) {
            nuevasImages = images.map((img: string) => {
              if (img.startsWith('http')) return img
              
              if (img.startsWith('/uploads/images/')) {
                const nombreArchivo = img.replace('/uploads/images/', '')
                const rutaCompleta = path.join(uploadsDir, nombreArchivo)
                if (fs.existsSync(rutaCompleta)) {
                  return `/uploads/${nombreArchivo}`
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

// Ejecutar
fixImagePathsToUploads()
  .then(() => {
    console.log('\n✅ Corrección completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })





