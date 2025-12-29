// Script para agregar tabla properties
// Ejecutar: npx tsx scripts/add-properties-table.ts

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addPropertiesTable() {
  const client = await pool.connect()

  try {
    console.log('🚀 Agregando tabla properties...')

    // Crear tabla properties
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('alquiler', 'venta', 'alquiler-temporal')),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        rooms INTEGER,
        bathrooms INTEGER,
        area_m2 DECIMAL(10, 2),
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        images TEXT, -- JSON array de URLs
        image_url TEXT, -- Primera imagen
        phone VARCHAR(20),
        whatsapp VARCHAR(20),
        email VARCHAR(255),
        instagram VARCHAR(100),
        professional_service BOOLEAN DEFAULT FALSE,
        professional_service_requested_at TIMESTAMP,
        featured BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla properties creada')

    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
      CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(zone_id);
      CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
      CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(active);
      CREATE INDEX IF NOT EXISTS idx_properties_professional ON properties(professional_service);
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
addPropertiesTable()
  .then(() => {
    console.log('✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

