// Script para agregar listing_id a conversations
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addListingIdToConversations() {
  const client = await pool.connect()

  try {
    console.log('🚀 Agregando listing_id a conversations...\n')

    // Verificar si listing_id ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations' AND column_name = 'listing_id'
    `)

    if (checkColumn.rows.length === 0) {
      // Agregar listing_id
      await client.query(`
        ALTER TABLE conversations 
        ADD COLUMN listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE;
      `)
      console.log('✅ Columna listing_id agregada a conversations')

      // Crear índice
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
      `)
      console.log('✅ Índice de listing_id creado')
    } else {
      console.log('✅ Columna listing_id ya existe')
    }

    console.log('\n🎉 Migración completada!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addListingIdToConversations()
  .then(() => {
    console.log('\n✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

