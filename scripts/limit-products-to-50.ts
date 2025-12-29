// Script para desactivar productos y dejar solo 50 activos
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function limitProductsTo50() {
  const client = await pool.connect()

  try {
    console.log('🔄 Limitando productos activos a 50...\n')

    // Obtener total de productos activos
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM listings
      WHERE active = true
    `)

    const total = parseInt(countResult.rows[0].total)
    console.log(`📊 Productos activos actuales: ${total}`)

    if (total <= 50) {
      console.log('✅ Ya tienes 50 o menos productos activos. No se necesita hacer cambios.')
      return
    }

    // Obtener los primeros 50 productos (ordenados por fecha de creación más reciente)
    const keepResult = await client.query(`
      SELECT id
      FROM listings
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT 50
    `)

    const keepIds = keepResult.rows.map(r => r.id)
    console.log(`✅ Manteniendo activos los primeros 50 productos (más recientes)\n`)

    // Desactivar el resto
    const updateResult = await client.query(`
      UPDATE listings
      SET active = false
      WHERE active = true
        AND id NOT IN (${keepIds.map((_, i) => `$${i + 1}`).join(', ')})
    `, keepIds)

    console.log(`✅ Productos desactivados: ${updateResult.rowCount}`)
    console.log(`✅ Productos activos ahora: 50`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar
limitProductsTo50()
  .then(() => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

