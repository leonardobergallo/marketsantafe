// Script para verificar productos específicos que dan error
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkSpecificProducts() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verificando productos específicos...\n')

    // Productos que están dando error según la consola
    const productosBuscar = [
      'Amd Micro socket AM5 (6° gen)',
      'Gadnic Mini Impresora',
      'Aureox Fuente ATX 500W',
      'Asus Mother skt AM5'
    ]

    for (const busqueda of productosBuscar) {
      const result = await client.query(`
        SELECT id, title, image_url, images
        FROM listings
        WHERE title LIKE $1
        LIMIT 1
      `, [`%${busqueda}%`])

      if (result.rows.length > 0) {
        const producto = result.rows[0]
        console.log(`\n📦 ${producto.title}`)
        console.log(`   image_url: "${producto.image_url}"`)
        
        if (producto.image_url) {
          const nombreArchivo = producto.image_url.replace('/images/', '').replace('/uploads/', '')
          const existe = fs.existsSync(`public/images/${nombreArchivo}`)
          console.log(`   ¿Existe?: ${existe ? '✅' : '❌'}`)
          
          if (!existe) {
            // Buscar archivos similares
            const files = fs.readdirSync('public/images')
            const similares = files.filter(f => 
              f.toLowerCase().includes(producto.title.toLowerCase().substring(0, 15).replace(/[^a-z0-9]/g, ''))
            )
            console.log(`   Archivos similares encontrados: ${similares.length}`)
            if (similares.length > 0) {
              console.log(`   → ${similares[0]}`)
              
              // Actualizar
              const nuevaRuta = `/images/${similares[0]}`
              await client.query(
                `UPDATE listings SET image_url = $1, images = $2 WHERE id = $3`,
                [nuevaRuta, JSON.stringify([nuevaRuta]), producto.id]
              )
              console.log(`   ✅ Actualizado a: ${nuevaRuta}`)
            }
          }
        }
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
  }
}

checkSpecificProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


