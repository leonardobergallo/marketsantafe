// Script para agregar tabla stores y campo store_id a listings
// Ejecutar: npx tsx scripts/add-stores-table.ts

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addStoresTable() {
  const client = await pool.connect()

  try {
    console.log('🚀 Agregando tabla stores y campo store_id...')

    // Crear tabla stores
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        description TEXT,
        logo_url TEXT,
        cover_image_url TEXT,
        phone VARCHAR(20),
        whatsapp VARCHAR(20),
        email VARCHAR(255),
        instagram VARCHAR(100),
        address TEXT,
        zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
        active BOOLEAN DEFAULT TRUE,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla stores creada')

    // Agregar store_id a listings si no existe
    const columnExists = await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'listings' AND column_name = 'store_id'
    `)
    
    if (columnExists.rows.length === 0) {
      await client.query(`
        ALTER TABLE listings ADD COLUMN store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL
      `)
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_listings_store ON listings(store_id)
      `)
      console.log('✅ Campo store_id agregado a listings')
    } else {
      console.log('✅ Campo store_id ya existe en listings')
    }

    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stores_user ON stores(user_id);
      CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
      CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(active);
    `)
    console.log('✅ Índices creados')

    console.log('🎉 Migración completada!')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar migración
addStoresTable()
  .then(() => {
    console.log('✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

