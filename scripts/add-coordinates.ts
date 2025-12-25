// Script para agregar columnas de coordenadas a la tabla restaurants
// TypeScript: script de migración
// En JavaScript sería similar pero sin tipos

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addCoordinates() {
  const client = await pool.connect()

  try {
    console.log('🗺️ Agregando columnas de coordenadas...')

    // Agregar columnas si no existen
    await client.query(`
      ALTER TABLE restaurants 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    `)

    console.log('✅ Columnas de coordenadas agregadas')

    // Actualizar restaurantes existentes con coordenadas
    const restaurants = [
      { name: 'Pizzería El Buen Sabor', lat: -31.6333, lng: -60.7000 },
      { name: 'Restaurante La Esquina', lat: -31.6200, lng: -60.7100 },
    ]

    for (const restaurant of restaurants) {
      await client.query(
        `UPDATE restaurants 
         SET latitude = $1, longitude = $2 
         WHERE name = $3`,
        [restaurant.lat, restaurant.lng, restaurant.name]
      )
    }

    console.log('✅ Coordenadas actualizadas para restaurantes existentes')
    console.log('🎉 Migración completada!')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos la migración
addCoordinates()
  .then(() => {
    console.log('✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })





