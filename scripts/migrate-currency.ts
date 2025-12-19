// Script de migración para agregar campo currency
// Ejecutar: npm run db:migrate-currency

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateCurrency() {
  const client = await pool.connect()

  try {
    console.log('🔄 Migrando tabla listings para soportar currency...')

    // Agregar campo currency a listings
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'currency'
        ) THEN
          ALTER TABLE listings ADD COLUMN currency VARCHAR(3) DEFAULT 'ARS';
          RAISE NOTICE 'Campo currency agregado a listings';
        ELSE
          RAISE NOTICE 'Campo currency ya existe en listings';
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

migrateCurrency()
  .then(() => {
    console.log('✅ Migración completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

