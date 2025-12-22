// Script para eliminar productos y restaurantes de ejemplo de la base de datos
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno (intentar .env.local primero, luego .env)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { pool } from '../lib/db'

async function cleanExamples() {
  const client = await pool.connect()

  try {
    console.log('🧹 Limpiando productos y restaurantes de ejemplo...')

    // Eliminar listings (publicaciones del mercado)
    const listingsResult = await client.query('DELETE FROM listings RETURNING id, title')
    console.log(`✅ ${listingsResult.rows.length} publicaciones eliminadas`)
    
    if (listingsResult.rows.length > 0) {
      console.log('   Publicaciones eliminadas:')
      listingsResult.rows.forEach((row: any) => {
        console.log(`   - ${row.title} (ID: ${row.id})`)
      })
    }

    // Eliminar restaurantes
    const restaurantsResult = await client.query('DELETE FROM restaurants RETURNING id, name')
    console.log(`✅ ${restaurantsResult.rows.length} restaurantes eliminados`)
    
    if (restaurantsResult.rows.length > 0) {
      console.log('   Restaurantes eliminados:')
      restaurantsResult.rows.forEach((row: any) => {
        console.log(`   - ${row.name} (ID: ${row.id})`)
      })
    }

    // Eliminar platos/menús
    const menuItemsResult = await client.query('DELETE FROM menu_items RETURNING id, name')
    console.log(`✅ ${menuItemsResult.rows.length} platos eliminados`)

    // Eliminar horarios de restaurantes
    const hoursResult = await client.query('DELETE FROM restaurant_hours RETURNING id')
    console.log(`✅ ${hoursResult.rows.length} horarios eliminados`)

    // Opcional: Eliminar usuarios de ejemplo (solo si no tienen publicaciones)
    // Descomenta esto si también quieres eliminar usuarios de ejemplo
    /*
    const usersResult = await client.query(`
      DELETE FROM users 
      WHERE id NOT IN (SELECT DISTINCT user_id FROM listings WHERE user_id IS NOT NULL)
        AND id NOT IN (SELECT DISTINCT user_id FROM restaurants WHERE user_id IS NOT NULL)
      RETURNING id, name
    `)
    console.log(`✅ ${usersResult.rows.length} usuarios de ejemplo eliminados`)
    */

    console.log('✅ Limpieza completada. La base de datos está lista para productos reales.')
  } catch (error) {
    console.error('❌ Error limpiando ejemplos:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

cleanExamples()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

