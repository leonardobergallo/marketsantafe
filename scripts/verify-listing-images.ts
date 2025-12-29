// Script para verificar cómo se están guardando las imágenes
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function verifyListingImages() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verificando cómo se guardan las imágenes...\n')

    // Obtener un listing específico
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL
      LIMIT 5
    `)

    for (const listing of result.rows) {
      console.log(`\n📦 ID: ${listing.id}`)
      console.log(`   Título: ${listing.title.substring(0, 50)}`)
      console.log(`   image_url (raw): ${listing.image_url}`)
      console.log(`   images (raw): ${listing.images}`)
      
      // Verificar si existe el archivo
      if (listing.image_url) {
        const ruta = listing.image_url.startsWith('/')
          ? `public${listing.image_url}`
          : `public/uploads/${listing.image_url}`
        
        const existe = fs.existsSync(ruta)
        console.log(`   Ruta completa: ${ruta}`)
        console.log(`   ¿Existe?: ${existe ? '✅ SÍ' : '❌ NO'}`)
        
        if (!existe && !listing.image_url.startsWith('http')) {
          // Buscar en images
          const nombreArchivo = listing.image_url.replace('/uploads/', '').replace('/images/', '')
          const rutaAlt = `public/images/${nombreArchivo}`
          const existeAlt = fs.existsSync(rutaAlt)
          console.log(`   Alternativa: ${rutaAlt}`)
          console.log(`   ¿Existe alternativa?: ${existeAlt ? '✅ SÍ' : '❌ NO'}`)
        }
      }

      // Parsear images array
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          console.log(`   images (parsed): ${JSON.stringify(images)}`)
          
          if (Array.isArray(images) && images.length > 0) {
            images.forEach((img: string, idx: number) => {
              const ruta = img.startsWith('/')
                ? `public${img}`
                : `public/uploads/${img}`
              const existe = fs.existsSync(ruta) || img.startsWith('http')
              console.log(`   Imagen ${idx + 1}: ${img} - ${existe ? '✅' : '❌'}`)
            })
          }
        } catch (e) {
          console.log(`   Error parseando images: ${e}`)
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

verifyListingImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


