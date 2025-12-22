import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local o .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { pool } from '../lib/db'

async function cleanAllListings() {
  const client = await pool.connect()

  try {
    console.log('🧹 Limpiando TODOS los productos de la base de datos...\n')

    // Eliminar todos los listings
    const deleteListingsResult = await client.query('DELETE FROM listings RETURNING id, title')
    console.log(`✅ ${deleteListingsResult.rows.length} publicaciones eliminadas`)
    
    if (deleteListingsResult.rows.length > 0) {
      console.log('\n   Publicaciones eliminadas:')
      deleteListingsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.title} (ID: ${row.id})`)
      })
    } else {
      console.log('   No había publicaciones para eliminar')
    }

    // También eliminar restaurantes si quieres (opcional)
    const deleteRestaurantsResult = await client.query('DELETE FROM restaurants RETURNING id, name')
    if (deleteRestaurantsResult.rows.length > 0) {
      console.log(`\n✅ ${deleteRestaurantsResult.rows.length} restaurantes eliminados`)
    }

    // Verificar que quedó limpio
    const remainingListings = await client.query('SELECT COUNT(*) as count FROM listings')
    const remainingRestaurants = await client.query('SELECT COUNT(*) as count FROM restaurants')
    
    console.log('\n📊 Estado final:')
    console.log(`   Listings restantes: ${remainingListings.rows[0].count}`)
    console.log(`   Restaurantes restantes: ${remainingRestaurants.rows[0].count}`)
    
    console.log('\n✅ Limpieza completada. La base de datos está lista para nuevos productos.')
  } catch (error) {
    console.error('❌ Error al limpiar:', error)
    throw error
  } finally {
    client.release()
  }
}

cleanAllListings()
  .then(() => {
    pool.end()
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error en el script de limpieza:', err)
    pool.end()
    process.exit(1)
  })

