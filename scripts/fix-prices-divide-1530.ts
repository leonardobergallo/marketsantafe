// Script para dividir precios por 1530 (revertir la multiplicación anterior)
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function fixPricesDivide1530() {
  const client = await pool.connect()

  try {
    console.log('💰 Dividiendo todos los precios por 1530...\n')

    // Obtener todos los listings con precio > 0
    const result = await client.query(`
      SELECT id, title, price
      FROM listings
      WHERE price > 0
      ORDER BY id
    `)

    console.log(`📊 Productos a actualizar: ${result.rows.length}\n`)

    let actualizados = 0
    let errores = 0

    for (const listing of result.rows) {
      try {
        // Dividir precio por 1530
        const nuevoPrecio = parseFloat(listing.price) / 1530

        // Actualizar en la base de datos
        await client.query(
          `UPDATE listings 
           SET price = $1
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
        errores++
      }
    }

    console.log(`\n✅ Precios actualizados: ${actualizados}`)
    if (errores > 0) {
      console.log(`❌ Errores: ${errores}`)
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixPricesDivide1530()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


