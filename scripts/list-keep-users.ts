// Script para listar usuarios que se mantendrán (admin, Solar, Leonardo)
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function listKeepUsers() {
  const client = await pool.connect()

  try {
    console.log('📋 Buscando usuarios a mantener...\n')

    // Buscar admin
    const adminResult = await client.query(
      "SELECT id, name, email, is_admin, is_business, business_name FROM users WHERE email = 'admin@marketsantafe.com' OR is_admin = TRUE LIMIT 1"
    )

    // Buscar Solar
    const solarResult = await client.query(
      "SELECT id, name, email, is_admin, is_business, business_name FROM users WHERE email = 'solar@propiedades.com' OR business_name ILIKE '%solar%' LIMIT 1"
    )

    // Buscar Leonardo
    const leonardoResult = await client.query(
      "SELECT id, name, email, is_admin, is_business, business_name FROM users WHERE email ILIKE '%leonardo%' OR name ILIKE '%leonardo%' LIMIT 1"
    )

    console.log('👤 USUARIOS A MANTENER:\n')

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0]
      console.log('✅ ADMINISTRADOR:')
      console.log(`   ID: ${admin.id}`)
      console.log(`   Nombre: ${admin.name}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Password: Admin123!`)
      console.log(`   Es Admin: ${admin.is_admin ? 'Sí' : 'No'}`)
      console.log('')
    } else {
      console.log('⚠️  ADMINISTRADOR: No encontrado')
      console.log('   Email: admin@marketsantafe.com')
      console.log('   Password: Admin123!')
      console.log('')
    }

    if (solarResult.rows.length > 0) {
      const solar = solarResult.rows[0]
      console.log('✅ SOLAR:')
      console.log(`   ID: ${solar.id}`)
      console.log(`   Nombre: ${solar.name}`)
      console.log(`   Email: ${solar.email}`)
      console.log(`   Password: solar123`)
      console.log(`   Negocio: ${solar.business_name || 'N/A'}`)
      console.log('')
    } else {
      console.log('⚠️  SOLAR: No encontrado')
      console.log('   Email: solar@propiedades.com')
      console.log('   Password: solar123')
      console.log('')
    }

    if (leonardoResult.rows.length > 0) {
      const leonardo = leonardoResult.rows[0]
      console.log('✅ LEONARDO:')
      console.log(`   ID: ${leonardo.id}`)
      console.log(`   Nombre: ${leonardo.name}`)
      console.log(`   Email: ${leonardo.email}`)
      console.log(`   Password: (verificar en base de datos)`)
      console.log(`   Negocio: ${leonardo.business_name || 'N/A'}`)
      console.log('')
    } else {
      console.log('⚠️  LEONARDO: No encontrado')
      console.log('')
    }

    // Listar todos los usuarios para referencia
    const allUsers = await client.query(
      'SELECT id, name, email, is_admin, is_business, business_name FROM users ORDER BY id'
    )

    console.log(`\n📊 Total de usuarios en la base de datos: ${allUsers.rows.length}`)
    console.log('\n📝 Todos los usuarios:')
    allUsers.rows.forEach((user: any) => {
      const keep = 
        user.email === 'admin@marketsantafe.com' ||
        user.is_admin === true ||
        user.email === 'solar@propiedades.com' ||
        user.business_name?.toLowerCase().includes('solar') ||
        user.email?.toLowerCase().includes('leonardo') ||
        user.name?.toLowerCase().includes('leonardo')
      
      console.log(`   ${keep ? '✅' : '❌'} ID: ${user.id} | ${user.name} | ${user.email} | Admin: ${user.is_admin ? 'Sí' : 'No'}`)
    })

  } catch (error) {
    console.error('❌ Error listando usuarios:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
listKeepUsers()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

