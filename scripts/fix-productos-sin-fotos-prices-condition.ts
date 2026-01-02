// Script para corregir precios y condiciones de productos_sin_fotos
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function fixProductosSinFotosPricesCondition() {
  const client = await pool.connect()

  try {
    console.log('🔄 Corrigiendo precios y condiciones...\n')

    // 1. Productos SIN fotos (productos_sin_fotos) - dividir por 1530 y marcar como "usado"
    const resultSinFotos = await client.query(`
      UPDATE listings 
      SET 
        price = price / 1530,
        condition = 'usado'
      WHERE (image_url IS NULL OR image_url = '') 
        AND (images IS NULL OR images::text = '[]' OR images::text = 'null' OR images::text = '""')
        AND price > 0
      RETURNING id, title, price, condition
    `)

    console.log(`✅ Productos sin fotos actualizados (precio ÷ 1530, condición = "usado"): ${resultSinFotos.rowCount}`)

    if (resultSinFotos.rows.length > 0) {
      console.log('\n📋 Ejemplos de productos sin fotos actualizados:')
      resultSinFotos.rows.slice(0, 5).forEach((row: any) => {
        console.log(`   - ${row.title} | Precio: $${row.price.toLocaleString('es-AR')} | ${row.condition}`)
      })
    }

    // 2. Productos CON fotos (del primer Excel) - si no son "usado", marcarlos como "nuevo"
    const resultConFotos = await client.query(`
      UPDATE listings 
      SET condition = 'nuevo'
      WHERE ((image_url IS NOT NULL AND image_url != '') 
        OR (images IS NOT NULL AND images::text != '[]' AND images::text != 'null' AND images::text != '""'))
      AND condition != 'usado'
      AND condition IS NOT NULL
      RETURNING id, title, condition
    `)

    console.log(`\n✅ Productos con fotos actualizados a "nuevo": ${resultConFotos.rowCount}`)

    if (resultConFotos.rows.length > 0) {
      console.log('\n📋 Ejemplos de productos con fotos actualizados:')
      resultConFotos.rows.slice(0, 5).forEach((row: any) => {
        console.log(`   - ${row.title} | ${row.condition}`)
      })
    }

    // 3. También actualizar monitores con fotos a "nuevo"
    const resultMonitores = await client.query(`
      UPDATE listings 
      SET condition = 'nuevo'
      WHERE (title ILIKE '%monitor%' OR title ILIKE '%Monitor%')
        AND ((image_url IS NOT NULL AND image_url != '') 
             OR (images IS NOT NULL AND images::text != '[]' AND images::text != 'null' AND images::text != '""'))
        AND condition = 'usado'
      RETURNING id, title, condition
    `)

    console.log(`\n✅ Monitores con fotos actualizados a "nuevo": ${resultMonitores.rowCount}`)

    if (resultMonitores.rows.length > 0) {
      console.log('\n📋 Monitores actualizados:')
      resultMonitores.rows.forEach((row: any) => {
        console.log(`   - ${row.title} | ${row.condition}`)
      })
    }

    // Resumen final
    const summary = await client.query(`
      SELECT 
        condition,
        COUNT(*) as total
      FROM listings
      WHERE active = true
      GROUP BY condition
      ORDER BY condition
    `)

    console.log('\n📊 Resumen de condiciones:')
    summary.rows.forEach((row: any) => {
      console.log(`   ${row.condition || 'NULL'}: ${row.total}`)
    })

    console.log('\n✅ Proceso completado!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixProductosSinFotosPricesCondition()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

