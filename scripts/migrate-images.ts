// Script de migración para agregar soporte de múltiples imágenes
// Ejecutar: npm run db:migrate-images

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateImages() {
  const client = await pool.connect()

  try {
    console.log('🔄 Migrando tablas para soportar múltiples imágenes...')

    // Agregar campo images (JSON) a listings si no existe
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'listings' AND column_name = 'images'
        ) THEN
          ALTER TABLE listings ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
          RAISE NOTICE 'Campo images agregado a listings';
        ELSE
          RAISE NOTICE 'Campo images ya existe en listings';
        END IF;
      END $$;
    `)

    // Agregar campo images (JSON) a restaurants si no existe
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'restaurants' AND column_name = 'images'
        ) THEN
          ALTER TABLE restaurants ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
          RAISE NOTICE 'Campo images agregado a restaurants';
        ELSE
          RAISE NOTICE 'Campo images ya existe en restaurants';
        END IF;
      END $$;
    `)

    // Migrar image_url existente a images si hay datos
    await client.query(`
      UPDATE listings 
      SET images = jsonb_build_array(image_url)
      WHERE image_url IS NOT NULL 
        AND image_url != ''
        AND (images IS NULL OR images = '[]'::jsonb);
    `)

    await client.query(`
      UPDATE restaurants 
      SET images = jsonb_build_array(image_url)
      WHERE image_url IS NOT NULL 
        AND image_url != ''
        AND (images IS NULL OR images = '[]'::jsonb);
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
migrateImages()
  .then(() => {
    console.log('✅ Migración completada exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

