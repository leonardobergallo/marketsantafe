// Script para verificar qué imágenes se están usando realmente
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function verifyUsedImages() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verificando imágenes utilizadas en la base de datos...\n')

    // Obtener todas las imágenes de listings
    const listingsResult = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
      ORDER BY id
      LIMIT 20
    `)

    console.log(`📊 Revisando ${listingsResult.rows.length} productos...\n`)

    const usedImages = new Set<string>()
    const missingImages: Array<{ id: number; title: string; image: string }> = []

    for (const row of listingsResult.rows) {
      const imagesToCheck: string[] = []

      if (row.image_url) {
        imagesToCheck.push(row.image_url)
      }
      if (row.images) {
        try {
          const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
          if (Array.isArray(images)) {
            images.forEach((img: string) => {
              if (img && !img.startsWith('http')) {
                imagesToCheck.push(img)
              }
            })
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }

      for (const img of imagesToCheck) {
        // Normalizar la ruta
        let imgPath = img
          .replace(/^\/uploads\/images\//, '')
          .replace(/^\/images\//, '')
          .replace(/^\/uploads\//, '')
          .replace(/^uploads\/images\//, '')
          .replace(/^images\//, '')
          .trim()

        if (imgPath && !imgPath.startsWith('http')) {
          usedImages.add(imgPath)
          const fileName = path.basename(imgPath)

          // Verificar si existe
          const possiblePaths = [
            path.join(process.cwd(), 'public', 'uploads', 'images', imgPath),
            path.join(process.cwd(), 'public', 'uploads', 'images', fileName),
            path.join(process.cwd(), 'public', 'uploads', imgPath),
            path.join(process.cwd(), 'public', 'uploads', fileName),
            path.join(process.cwd(), 'public', 'images', imgPath),
            path.join(process.cwd(), 'public', 'images', fileName),
          ]

          const exists = possiblePaths.some(p => fs.existsSync(p))

          if (!exists) {
            missingImages.push({
              id: row.id,
              title: row.title.substring(0, 40),
              image: imgPath
            })
          }
        }
      }
    }

    console.log(`✅ Imágenes utilizadas encontradas: ${usedImages.size}`)
    console.log(`❌ Imágenes faltantes: ${missingImages.length}\n`)

    if (missingImages.length > 0) {
      console.log('📋 Imágenes que están en la BD pero no existen en el sistema de archivos:')
      missingImages.slice(0, 20).forEach(item => {
        console.log(`   - Producto ID ${item.id}: "${item.title}"`)
        console.log(`     Imagen: ${item.image}`)
      })
      if (missingImages.length > 20) {
        console.log(`   ... y ${missingImages.length - 20} más\n`)
      }
    }

    // Mostrar algunas imágenes utilizadas
    console.log('\n📋 Primeras 10 imágenes utilizadas:')
    Array.from(usedImages).slice(0, 10).forEach(img => {
      const fileName = path.basename(img)
      console.log(`   - ${fileName}`)
    })

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar
verifyUsedImages()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

