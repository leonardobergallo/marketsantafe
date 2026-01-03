// Script para verificar el producto Gadnic Moldes
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkGadnicMoldes() {
  const client = await pool.connect()

  try {
    // Buscar el producto
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE title LIKE '%Gadnic Moldes%'
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      console.log('No se encontró el producto')
      return
    }

    const producto = result.rows[0]
    console.log('Producto encontrado:')
    console.log('ID:', producto.id)
    console.log('Título:', producto.title)
    console.log('image_url:', producto.image_url)
    console.log('images:', producto.images)

    // Buscar archivos que coincidan
    const imagesDir = 'public/images'
    const files = fs.readdirSync(imagesDir)
    const matchingFiles = files.filter(f => 
      f.toLowerCase().includes('gadnic') && 
      f.toLowerCase().includes('moldes')
    )

    console.log('\nArchivos que coinciden:')
    matchingFiles.forEach(f => console.log('  -', f))

    if (matchingFiles.length > 0) {
      const mejorMatch = matchingFiles[0]
      const nuevaRuta = `/images/${mejorMatch}`
      
      console.log(`\n✅ Actualizando a: ${nuevaRuta}`)
      
      await client.query(
        `UPDATE listings 
         SET image_url = $1, images = $2
         WHERE id = $3`,
        [nuevaRuta, JSON.stringify([nuevaRuta]), producto.id]
      )
      
      console.log('✅ Actualizado!')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

checkGadnicMoldes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })






