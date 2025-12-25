// Script para agregar campo de agente de inmobiliaria
// Ejecutar con: npx tsx scripts/migrate-inmobiliaria-agent.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateInmobiliariaAgent() {
  const client = await pool.connect()

  try {
    console.log('🔄 Agregando campo is_inmobiliaria_agent...')

    // Agregar campo is_inmobiliaria_agent a la tabla users
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'is_inmobiliaria_agent'
        ) THEN
          ALTER TABLE users ADD COLUMN is_inmobiliaria_agent BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Campo is_inmobiliaria_agent agregado a users';
        ELSE
          RAISE NOTICE 'Campo is_inmobiliaria_agent ya existe en users';
        END IF;
      END $$;
    `)

    console.log('✅ Migración completada')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
  }
}

migrateInmobiliariaAgent()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

