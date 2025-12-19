// Script de migración para agregar campos de autenticación
// Ejecutar: npm run db:migrate-auth

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateAuth() {
  const client = await pool.connect()

  try {
    console.log('🔄 Migrando tabla users para autenticación...')

    // Agregar password_hash si no existe
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password_hash'
        ) THEN
          ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
          RAISE NOTICE 'Campo password_hash agregado';
        ELSE
          RAISE NOTICE 'Campo password_hash ya existe';
        END IF;
      END $$;
    `)

    // Agregar verified si no existe
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'verified'
        ) THEN
          ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Campo verified agregado';
        ELSE
          RAISE NOTICE 'Campo verified ya existe';
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

// Ejecutamos la migración
migrateAuth()
  .then(() => {
    console.log('✅ Migración completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

