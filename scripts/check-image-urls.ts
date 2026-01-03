// Script para verificar y mostrar las URLs de las imágenes tal como están en la BD
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkImageUrls() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verificando URLs de imágenes...\n')

    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE image_url IS NOT NULL
      LIMIT 5
    `)

    for (const listing of result.rows) {
      console.log(`\n📦 ${listing.title.substring(0, 40)}`)
      console.log(`   image_url: "${listing.image_url}"`)
      console.log(`   image_url (encoded): "${encodeURI(listing.image_url)}"`)
      
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images) && images.length > 0) {
            console.log(`   images[0]: "${images[0]}"`)
            console.log(`   images[0] (encoded): "${encodeURI(images[0])}"`)
          }
        } catch (e) {
          console.log(`   images (raw): "${listing.images}"`)
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

checkImageUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })






