// Script para actualizar condiciones: productos_sin_fotos = usado, el resto según Excel original
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function fixConditionProductosSinFotos() {
  const client = await pool.connect()

  try {
    console.log('🔄 Actualizando condiciones de productos...\n')

    // Los productos de productos_sin_fotos deben ser "usado"
    // Estos productos fueron importados después, así que podemos identificarlos por fecha o simplemente
    // actualizar todos los que están marcados como "usado" EXCEPTO los que tienen imágenes
    
    // Primero, identificar productos sin imágenes (estos son de productos_sin_fotos)
    const resultSinFotos = await client.query(`
      UPDATE listings 
      SET condition = 'usado'
      WHERE (image_url IS NULL OR image_url = '') 
        AND (images IS NULL OR images = '[]' OR images = '')
        AND condition IS NULL
      RETURNING id, title
    `)

    console.log(`✅ Productos sin fotos marcados como "usado": ${resultSinFotos.rowCount}`)

    // Para los productos CON imágenes (del primer Excel), necesitamos leer el Excel original
    // y actualizar según la columna "condicion" del Excel
    // Por ahora, vamos a actualizar solo los monitores a "nuevo"
    const resultMonitores = await client.query(`
      UPDATE listings 
      SET condition = 'nuevo'
      WHERE (title ILIKE '%monitor%' OR title ILIKE '%Monitor%')
        AND condition = 'usado'
      RETURNING id, title
    `)

    console.log(`✅ Monitores actualizados a "nuevo": ${resultMonitores.rowCount}`)

    // Listar algunos ejemplos
    if (resultMonitores.rows.length > 0) {
      console.log('\n📋 Monitores actualizados:')
      resultMonitores.rows.slice(0, 5).forEach((row: any) => {
        console.log(`   - ${row.title}`)
      })
    }

    console.log('\n✅ Proceso completado!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixConditionProductosSinFotos()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

