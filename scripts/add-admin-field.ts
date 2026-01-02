// Script para agregar campo is_admin a la tabla users si no existe
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addAdminField() {
  const client = await pool.connect()

  try {
    console.log('🔧 Verificando campo is_admin en tabla users...')

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('✅ El campo is_admin ya existe en la tabla users')
      return
    }

    // Agregar columna is_admin
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL
    `)

    console.log('✅ Campo is_admin agregado exitosamente a la tabla users')

    // Crear índice para búsquedas rápidas de admins
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE
    `)

    console.log('✅ Índice creado para is_admin')
  } catch (error) {
    console.error('❌ Error al agregar campo is_admin:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
addAdminField()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

