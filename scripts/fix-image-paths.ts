// Script para verificar y corregir rutas de imágenes en la base de datos
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixImagePaths() {
  const client = await pool.connect()

  try {
    console.log('🖼️  Verificando y corrigiendo rutas de imágenes...\n')

    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
    `)

    console.log(`📊 Total de productos: ${result.rows.length}`)

    let actualizados = 0
    let sinImagen = 0

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Verificar image_url
      if (listing.image_url) {
        const ruta = listing.image_url.startsWith('/')
          ? `public${listing.image_url}`
          : `public/uploads/${listing.image_url}`
        
        if (!fs.existsSync(ruta) && !listing.image_url.startsWith('http')) {
          // Intentar buscar en images
          const nombreArchivo = listing.image_url.replace('/uploads/', '').replace('/images/', '')
          const rutaAlternativa = `public/images/${nombreArchivo}`
          
          if (fs.existsSync(rutaAlternativa)) {
            nuevoImageUrl = `/images/${nombreArchivo}`
            necesitaActualizar = true
            console.log(`✅ ${listing.title.substring(0, 40)}: Corregida ruta a /images/`)
          } else {
            console.log(`⚠️  ${listing.title.substring(0, 40)}: Imagen no encontrada`)
            sinImagen++
          }
        } else if (listing.image_url.startsWith('/uploads/')) {
          // Verificar que existe
          if (fs.existsSync(`public${listing.image_url}`)) {
            // Ya está bien
          } else {
            // Intentar buscar en images
            const nombreArchivo = listing.image_url.replace('/uploads/', '')
            const rutaAlternativa = `public/images/${nombreArchivo}`
            
            if (fs.existsSync(rutaAlternativa)) {
              nuevoImageUrl = `/images/${nombreArchivo}`
              necesitaActualizar = true
              console.log(`✅ ${listing.title.substring(0, 40)}: Corregida ruta`)
            }
          }
        }
      }

      // Verificar images (array)
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
              
              const ruta = img.startsWith('/')
                ? `public${img}`
                : `public/uploads/${img}`
              
              if (fs.existsSync(ruta)) {
                return img.startsWith('/') ? img : `/uploads/${img}`
              } else {
                // Intentar buscar en images
                const nombreArchivo = img.replace('/uploads/', '').replace('/images/', '')
                const rutaAlternativa = `public/images/${nombreArchivo}`
                
                if (fs.existsSync(rutaAlternativa)) {
                  return `/images/${nombreArchivo}`
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
      }
    }

    console.log(`\n✅ Productos actualizados: ${actualizados}`)
    console.log(`⚠️  Productos sin imagen: ${sinImagen}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

fixImagePaths()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })






