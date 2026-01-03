// Script para eliminar productos de ejemplo
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function deleteExampleProducts() {
  const client = await pool.connect()

  try {
    console.log('🗑️  Eliminando productos de ejemplo...\n')

    // Eliminar productos que tienen "Ejemplo" o "ejemplo" en el título
    const deleteResult = await client.query(
      `DELETE FROM listings WHERE title LIKE '%Ejemplo%' OR title LIKE '%ejemplo%'`
    )

    console.log(`✅ Eliminados ${deleteResult.rowCount} productos de ejemplo`)

    // Eliminar restaurantes de ejemplo
    const deleteRestaurantsResult = await client.query(
      `DELETE FROM restaurants WHERE name LIKE '%Ejemplo%' OR name LIKE '%ejemplo%'`
    )

    console.log(`✅ Eliminados ${deleteRestaurantsResult.rowCount} restaurantes de ejemplo`)

    console.log('\n✅ Productos de ejemplo eliminados exitosamente')

  } catch (error) {
    console.error('❌ Error eliminando productos:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
deleteExampleProducts()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })


