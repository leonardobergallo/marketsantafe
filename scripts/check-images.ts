// Script para verificar rutas de imágenes
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkImages() {
  const client = await pool.connect()

  try {
    console.log('🖼️  Verificando rutas de imágenes...\n')

    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL
      LIMIT 10
    `)

    for (const listing of result.rows) {
      console.log(`\n📦 ${listing.title.substring(0, 40)}`)
      console.log(`   image_url: ${listing.image_url}`)
      
      // Verificar si existe
      const ruta = listing.image_url.startsWith('/')
        ? `public${listing.image_url}`
        : `public/uploads/${listing.image_url}`
      
      const existe = fs.existsSync(ruta)
      console.log(`   Ruta: ${ruta}`)
      console.log(`   ¿Existe?: ${existe ? '✅' : '❌'}`)
      
      if (!existe && !listing.image_url.startsWith('http')) {
        // Intentar buscar en images
        const rutaAlternativa = `public/images/${listing.image_url.replace('/uploads/', '')}`
        const existeAlt = fs.existsSync(rutaAlternativa)
        console.log(`   Alternativa: ${rutaAlternativa}`)
        console.log(`   ¿Existe alternativa?: ${existeAlt ? '✅' : '❌'}`)
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

checkImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })





