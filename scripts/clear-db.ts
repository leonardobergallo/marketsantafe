// Script para borrar todos los datos de la base de datos
// TypeScript: script de Node.js para limpiar la base de datos
// En JavaScript sería similar pero sin tipos

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function clearDatabase() {
  const client = await pool.connect()

  try {
    console.log('🗑️  Borrando todos los datos de la base de datos...')

    // Borrar en orden para respetar las foreign keys
    // Primero las tablas que tienen referencias
    await client.query('DELETE FROM menu_items;')
    console.log('✅ menu_items borrados')

    await client.query('DELETE FROM restaurant_hours;')
    console.log('✅ restaurant_hours borrados')

    await client.query('DELETE FROM restaurants;')
    console.log('✅ restaurants borrados')

    await client.query('DELETE FROM listings;')
    console.log('✅ listings borrados')

    // Opcional: borrar usuarios también (descomenta si quieres borrar usuarios)
    // await client.query('DELETE FROM users;')
    // console.log('✅ users borrados')

    // Mantenemos zones y categories porque son datos de referencia
    // Si quieres borrarlos también, descomenta:
    // await client.query('DELETE FROM categories;')
    // await client.query('DELETE FROM zones;')

    console.log('🎉 Base de datos limpiada correctamente!')
    console.log('💡 Ahora puedes ejecutar: npm run db:seed para poblar con nuevos datos')
  } catch (error) {
    console.error('❌ Error al borrar los datos:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos la limpieza
clearDatabase()
  .then(() => {
    console.log('✅ Limpieza completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la limpieza:', error)
    process.exit(1)
  })






