// Script para verificar el producto de la impresora
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkImpresoraProduct() {
  const client = await pool.connect()

  try {
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
      WHERE title LIKE '%Gadnic Mini Impresora%'
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      console.log('No se encontró el producto')
      return
    }

    const producto = result.rows[0]
    console.log('Producto:')
    console.log('  Título:', producto.title)
    console.log('  image_url:', producto.image_url)
    console.log('  images:', producto.images)

    // Buscar archivo real
    const files = fs.readdirSync('public/uploads/images')
    const matching = files.filter(f => 
      f.toLowerCase().includes('gadnic') && 
      f.toLowerCase().includes('impresora')
    )

    console.log('\nArchivos que coinciden:')
    matching.forEach(f => {
      console.log('  -', f)
      console.log('    Longitud:', f.length)
    })

    if (matching.length > 0) {
      const archivoReal = matching[0]
      const nombreEnBD = producto.image_url?.replace('/uploads/images/', '') || ''
      
      console.log('\nComparación:')
      console.log('  En BD:', nombreEnBD)
      console.log('  Real:', archivoReal)
      console.log('  ¿Coinciden?:', nombreEnBD === archivoReal)
      console.log('  ¿Coinciden (lowercase)?:', nombreEnBD.toLowerCase() === archivoReal.toLowerCase())
      
      if (nombreEnBD !== archivoReal) {
        console.log('\n✅ Actualizando...')
        const nuevaRuta = `/uploads/images/${archivoReal}`
        await client.query(
          `UPDATE listings SET image_url = $1, images = $2 WHERE id = $3`,
          [nuevaRuta, JSON.stringify([nuevaRuta]), producto.id]
        )
        console.log('✅ Actualizado a:', nuevaRuta)
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

checkImpresoraProduct()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


