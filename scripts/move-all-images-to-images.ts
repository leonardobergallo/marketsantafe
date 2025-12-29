// Script para mover TODAS las imágenes de uploads/ a images/ y actualizar rutas
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function moveAllImagesToImages() {
  const client = await pool.connect()

  try {
    console.log('🔄 Moviendo TODAS las imágenes de uploads/ a images/...\n')

    const uploadsImagesDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    const imagesDir = path.join(process.cwd(), 'public', 'images')

    // Crear directorio images si no existe
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
      console.log('✅ Directorio public/images/ creado\n')
    }

    if (!fs.existsSync(uploadsImagesDir)) {
      console.log('⚠️  No existe public/uploads/images/')
      return
    }

    // Obtener TODOS los archivos de imagen de uploads/images/
    const archivos = fs.readdirSync(uploadsImagesDir).filter(f => {
      const filePath = path.join(uploadsImagesDir, f)
      if (fs.statSync(filePath).isFile()) {
        const ext = path.extname(f).toLowerCase()
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)
      }
      return false
    })

    console.log(`📁 Archivos encontrados en uploads/: ${archivos.length}`)

    let movidas = 0
    let duplicados = 0
    const archivosMovidos = new Map<string, string>() // nombre original -> nombre en images/

    // Mover todos los archivos
    for (const archivo of archivos) {
      const rutaOrigen = path.join(uploadsImagesDir, archivo)
      const rutaDestino = path.join(imagesDir, archivo)

      if (fs.existsSync(rutaDestino)) {
        // Ya existe, no mover pero registrar
        duplicados++
        archivosMovidos.set(archivo, archivo)
      } else {
        // Mover el archivo
        fs.copyFileSync(rutaOrigen, rutaDestino)
        movidas++
        archivosMovidos.set(archivo, archivo)
      }
    }

    console.log(`✅ Imágenes movidas: ${movidas}`)
    console.log(`⚠️  Duplicados (ya existían): ${duplicados}\n`)

    // Actualizar rutas en la base de datos
    console.log('🔄 Actualizando rutas en la base de datos...\n')

    const listingsResult = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    let actualizados = 0

    for (const listing of listingsResult.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Procesar image_url
      if (listing.image_url && !listing.image_url.startsWith('http')) {
        const nombreArchivo = path.basename(listing.image_url.replace(/^\/uploads\/images\//, '').replace(/^\/uploads\//, '').replace(/^\/images\//, ''))
        
        // Buscar si el archivo fue movido
        if (archivosMovidos.has(nombreArchivo) || fs.existsSync(path.join(imagesDir, nombreArchivo))) {
          nuevoImageUrl = `/images/${nombreArchivo}`
          if (nuevoImageUrl !== listing.image_url) {
            necesitaActualizar = true
          }
        }
      }

      // Procesar images array
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images)) {
            nuevasImages = images.map((img: string) => {
              if (img.startsWith('http')) return img
              
              const nombreArchivo = path.basename(img.replace(/^\/uploads\/images\//, '').replace(/^\/uploads\//, '').replace(/^\/images\//, ''))
              
              if (archivosMovidos.has(nombreArchivo) || fs.existsSync(path.join(imagesDir, nombreArchivo))) {
                return `/images/${nombreArchivo}`
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

      // Actualizar en BD si es necesario
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

    console.log(`✅ Productos actualizados en BD: ${actualizados}`)

    // Eliminar archivos de uploads/images/ que ya están en images/
    console.log('\n🗑️  Eliminando archivos de uploads/images/ que ya están en images/...')
    let eliminados = 0
    for (const archivo of archivos) {
      const rutaUploads = path.join(uploadsImagesDir, archivo)
      const rutaImages = path.join(imagesDir, archivo)
      
      if (fs.existsSync(rutaImages)) {
        fs.unlinkSync(rutaUploads)
        eliminados++
      }
    }
    console.log(`✅ Archivos eliminados de uploads/images/: ${eliminados}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar
moveAllImagesToImages()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

