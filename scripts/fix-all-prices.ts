// Script para multiplicar todos los precios por 1500
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixAllPrices() {
  const client = await pool.connect()

  try {
    console.log('💰 Multiplicando todos los precios por 1500...')

    // Obtener todos los listings con precio > 0
    const result = await client.query(`
      SELECT id, title, price, currency
      FROM listings
      WHERE price > 0
    `)

    console.log(`📊 Productos a actualizar: ${result.rows.length}`)

    let actualizados = 0

    for (const listing of result.rows) {
      try {
        // Multiplicar precio por 1500
        const nuevoPrecio = parseFloat(listing.price) * 1500

        // Actualizar en la base de datos
        await client.query(
          `UPDATE listings 
           SET price = $1, currency = 'ARS'
           WHERE id = $2`,
          [nuevoPrecio, listing.id]
        )

        actualizados++
        
        // Mostrar progreso cada 100 productos
        if (actualizados % 100 === 0) {
          console.log(`⏳ Actualizados: ${actualizados}/${result.rows.length}`)
        }
      } catch (error: any) {
        console.error(`❌ Error actualizando ${listing.title}:`, error.message)
      }
    }

    console.log(`\n✅ Precios actualizados: ${actualizados}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

fixAllPrices()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


