// Script para crear la tabla de leads (clientes potenciales)
// Ejecutar con: npx tsx scripts/migrate-leads.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateLeads() {
  const client = await pool.connect()

  try {
    console.log('🔄 Creando tabla de leads...')

    // Crear tabla de leads
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(255),
        phone TEXT,
        whatsapp TEXT,
        message TEXT,
        interest_type VARCHAR(50) CHECK (interest_type IN ('alquiler', 'venta', 'consulta', 'otro')),
        property_type VARCHAR(100),
        zone_preference VARCHAR(100),
        budget_min DECIMAL(12, 2),
        budget_max DECIMAL(12, 2),
        source VARCHAR(50) DEFAULT 'inmobiliaria-en-equipo',
        status VARCHAR(50) DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla leads creada')

    // Crear índices para búsquedas rápidas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
      CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
    `)
    console.log('✅ Índices creados')

    console.log('✅ Migración completada')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
  }
}

migrateLeads()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

