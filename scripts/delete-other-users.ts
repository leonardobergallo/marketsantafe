// Script para eliminar todos los usuarios excepto admin, Solar y Leonardo
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function deleteOtherUsers() {
  const client = await pool.connect()

  try {
    console.log('🗑️  Eliminando usuarios (excepto admin, Solar y Leonardo)...\n')

    // Primero, obtener los IDs de los usuarios a mantener
    const keepUsers: number[] = []

    // Buscar admin
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = 'admin@marketsantafe.com' OR is_admin = TRUE LIMIT 1"
    )
    if (adminResult.rows.length > 0) {
      keepUsers.push(adminResult.rows[0].id)
      console.log(`✅ Manteniendo admin (ID: ${adminResult.rows[0].id})`)
    }

    // Buscar Solar
    const solarResult = await client.query(
      "SELECT id FROM users WHERE email = 'solar@propiedades.com' OR business_name ILIKE '%solar%' LIMIT 1"
    )
    if (solarResult.rows.length > 0) {
      keepUsers.push(solarResult.rows[0].id)
      console.log(`✅ Manteniendo Solar (ID: ${solarResult.rows[0].id})`)
    }

    // Buscar todos los usuarios de Leonardo
    const leonardoResult = await client.query(
      "SELECT id, name, email FROM users WHERE email ILIKE '%leonardo%' OR name ILIKE '%leonardo%'"
    )
    if (leonardoResult.rows.length > 0) {
      leonardoResult.rows.forEach((user: any) => {
        keepUsers.push(user.id)
        console.log(`✅ Manteniendo Leonardo (ID: ${user.id} - ${user.email})`)
      })
    }

    if (keepUsers.length === 0) {
      console.log('⚠️  No se encontraron usuarios a mantener. Abortando...')
      return
    }

    console.log(`\n📊 Usuarios a mantener: ${keepUsers.length}`)
    console.log(`   IDs: ${keepUsers.join(', ')}\n`)

    // Contar usuarios a eliminar
    const countResult = await client.query(
      `SELECT COUNT(*) as count FROM users WHERE id NOT IN (${keepUsers.join(',')})`
    )
    const countToDelete = parseInt(countResult.rows[0].count)

    if (countToDelete === 0) {
      console.log('✅ No hay usuarios para eliminar')
      return
    }

    console.log(`⚠️  Se eliminarán ${countToDelete} usuarios`)
    console.log('   Esto también eliminará todas sus propiedades, productos y datos relacionados\n')

    // Listar usuarios que se eliminarán
    const usersToDelete = await client.query(
      `SELECT id, name, email, is_business, business_name FROM users WHERE id NOT IN (${keepUsers.join(',')}) ORDER BY id`
    )

    console.log('📝 Usuarios que se eliminarán:')
    usersToDelete.rows.forEach((user: any) => {
      console.log(`   - ID: ${user.id} | ${user.name} | ${user.email}`)
    })

    console.log('\n⚠️  Esta acción es IRREVERSIBLE. Presiona Ctrl+C para cancelar.')
    console.log('   Esperando 5 segundos...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Eliminar usuarios (CASCADE eliminará propiedades, productos, etc.)
    const deleteResult = await client.query(
      `DELETE FROM users WHERE id NOT IN (${keepUsers.join(',')})`
    )

    console.log(`✅ Eliminados ${deleteResult.rowCount} usuarios`)
    console.log('\n📊 Usuarios restantes:')
    
    const remainingUsers = await client.query(
      'SELECT id, name, email, is_admin, is_business, business_name FROM users ORDER BY id'
    )
    
    remainingUsers.rows.forEach((user: any) => {
      console.log(`   ✅ ID: ${user.id} | ${user.name} | ${user.email} | Admin: ${user.is_admin ? 'Sí' : 'No'}`)
    })

  } catch (error) {
    console.error('❌ Error eliminando usuarios:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
deleteOtherUsers()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

