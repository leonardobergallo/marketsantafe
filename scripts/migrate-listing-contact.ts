// Script de migración para agregar campos de contacto a listings
// Ejecutar: npm run db:migrate-listing-contact

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateListingContact() {
  const client = await pool.connect()

  try {
    console.log('🔄 Migrando tabla listings para soportar campos de contacto...')

    // Agregar campos de contacto a listings
    await client.query(`
      DO $$ 
      BEGIN
        -- Agregar whatsapp si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'whatsapp'
        ) THEN
          ALTER TABLE listings ADD COLUMN whatsapp VARCHAR(20);
          RAISE NOTICE 'Campo whatsapp agregado a listings';
        ELSE
          RAISE NOTICE 'Campo whatsapp ya existe en listings';
        END IF;
        
        -- Agregar phone si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'phone'
        ) THEN
          ALTER TABLE listings ADD COLUMN phone VARCHAR(20);
          RAISE NOTICE 'Campo phone agregado a listings';
        ELSE
          RAISE NOTICE 'Campo phone ya existe en listings';
        END IF;
        
        -- Agregar email si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'email'
        ) THEN
          ALTER TABLE listings ADD COLUMN email VARCHAR(255);
          RAISE NOTICE 'Campo email agregado a listings';
        ELSE
          RAISE NOTICE 'Campo email ya existe en listings';
        END IF;
        
        -- Agregar instagram si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'instagram'
        ) THEN
          ALTER TABLE listings ADD COLUMN instagram VARCHAR(100);
          RAISE NOTICE 'Campo instagram agregado a listings';
        ELSE
          RAISE NOTICE 'Campo instagram ya existe en listings';
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

migrateListingContact()
  .then(() => {
    console.log('✅ Migración completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

