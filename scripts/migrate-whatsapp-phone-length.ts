// Script para aumentar el tamaño de los campos phone y whatsapp
// Ya que WhatsApp puede ser una URL completa (más de 20 caracteres)

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { pool } from '../lib/db'

async function migrateWhatsAppPhoneLength() {
  const client = await pool.connect()

  try {
    console.log('🔄 Migrando campos phone y whatsapp a TEXT...')

    // Migrar tabla listings
    await client.query(`
      DO $$ 
      BEGIN
        -- Cambiar phone a TEXT si es VARCHAR(20)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' 
          AND column_name = 'phone' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE listings ALTER COLUMN phone TYPE TEXT;
          RAISE NOTICE 'Campo phone en listings migrado a TEXT';
        END IF;

        -- Cambiar whatsapp a TEXT si es VARCHAR(20)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' 
          AND column_name = 'whatsapp' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE listings ALTER COLUMN whatsapp TYPE TEXT;
          RAISE NOTICE 'Campo whatsapp en listings migrado a TEXT';
        END IF;

        -- Cambiar phone en restaurants
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'restaurants' 
          AND column_name = 'phone' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE restaurants ALTER COLUMN phone TYPE TEXT;
          RAISE NOTICE 'Campo phone en restaurants migrado a TEXT';
        END IF;

        -- Cambiar whatsapp en restaurants
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'restaurants' 
          AND column_name = 'whatsapp' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE restaurants ALTER COLUMN whatsapp TYPE TEXT;
          RAISE NOTICE 'Campo whatsapp en restaurants migrado a TEXT';
        END IF;

        -- Cambiar phone en users
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'phone' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE users ALTER COLUMN phone TYPE TEXT;
          RAISE NOTICE 'Campo phone en users migrado a TEXT';
        END IF;

        -- Cambiar whatsapp en users
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'whatsapp' 
          AND character_maximum_length = 20
        ) THEN
          ALTER TABLE users ALTER COLUMN whatsapp TYPE TEXT;
          RAISE NOTICE 'Campo whatsapp en users migrado a TEXT';
        END IF;
      END $$;
    `)

    console.log('✅ Migración completada')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateWhatsAppPhoneLength()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

