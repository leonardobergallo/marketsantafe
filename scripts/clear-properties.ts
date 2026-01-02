// Script para borrar todas las propiedades de la base de datos
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function clearProperties() {
  const client = await pool.connect()

  try {
    console.log('🗑️  Borrando todas las propiedades...')

    // Contar propiedades antes de borrar
    const countResult = await client.query('SELECT COUNT(*) as count FROM properties')
    const countBefore = parseInt(countResult.rows[0].count)
    console.log(`📊 Propiedades encontradas: ${countBefore}`)

    if (countBefore === 0) {
      console.log('✅ No hay propiedades para borrar')
      return
    }

    // Confirmar acción
    console.log(`⚠️  Se borrarán ${countBefore} propiedades`)
    console.log('⏳ Borrando...')

    // Borrar todas las propiedades
    const result = await client.query('DELETE FROM properties')
    const deletedCount = result.rowCount || 0

    console.log(`✅ ${deletedCount} propiedades borradas exitosamente`)
  } catch (error) {
    console.error('❌ Error al borrar propiedades:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
clearProperties()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

