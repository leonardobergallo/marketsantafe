// Script para crear tablas del sistema de chat
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addChatSystemTables() {
  const client = await pool.connect()

  try {
    console.log('🚀 Creando tablas del sistema de chat...\n')

    // 1. Tabla conversations (conversaciones entre cliente y vendedor)
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        buyer_name VARCHAR(200) NOT NULL,
        buyer_email VARCHAR(255),
        buyer_whatsapp VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
        last_message_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla conversations creada')

    // 2. Tabla messages (mensajes dentro de una conversación)
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('buyer', 'seller')),
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        message_text TEXT NOT NULL,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla messages creada')

    // Índices para conversations
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON conversations(property_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
      CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
    `)
    console.log('✅ Índices de conversations creados')

    // Índices para messages
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
    `)
    console.log('✅ Índices de messages creados')

    console.log('\n🎉 Tablas del sistema de chat creadas exitosamente!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addChatSystemTables()
  .then(() => {
    console.log('\n✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

