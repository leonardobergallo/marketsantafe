// Script para asignar todas las propiedades al usuario Solar Propiedades
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function assignPropertiesToSolar() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Buscando usuario solar@propiedades.com...')
    
    // Buscar el usuario Solar Propiedades
    const userResult = await client.query(
      `SELECT id, name, email FROM users WHERE email = $1`,
      ['solar@propiedades.com']
    )
    
    if (userResult.rows.length === 0) {
      console.error('❌ No se encontró el usuario solar@propiedades.com')
      console.log('📋 Usuarios disponibles:')
      const allUsers = await client.query('SELECT id, name, email FROM users ORDER BY id')
      allUsers.rows.forEach((u: any) => {
        console.log(`  - ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`)
      })
      return
    }
    
    const solarUser = userResult.rows[0]
    console.log(`✅ Usuario encontrado: ID ${solarUser.id}, ${solarUser.name} (${solarUser.email})`)
    
    // Contar propiedades actuales
    const countResult = await client.query('SELECT COUNT(*) as total FROM properties')
    const totalProperties = parseInt(countResult.rows[0].total)
    console.log(`📊 Total de propiedades en la base de datos: ${totalProperties}`)
    
    // Actualizar todas las propiedades
    console.log('🔄 Asignando todas las propiedades al usuario Solar Propiedades...')
    const updateResult = await client.query(
      `UPDATE properties SET user_id = $1 WHERE user_id IS NOT NULL OR user_id IS NULL`,
      [solarUser.id]
    )
    
    console.log(`✅ ${updateResult.rowCount} propiedades actualizadas`)
    
    // Verificar el resultado
    const verifyResult = await client.query(
      `SELECT COUNT(*) as total FROM properties WHERE user_id = $1`,
      [solarUser.id]
    )
    console.log(`✅ Verificación: ${verifyResult.rows[0].total} propiedades ahora pertenecen a ${solarUser.name}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

assignPropertiesToSolar()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error)
    process.exit(1)
  })

