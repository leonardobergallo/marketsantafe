// Script para crear usuario de ejemplo "Solar Propiedades"
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'
import bcrypt from 'bcryptjs'

async function createSolarUser() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creando usuario de ejemplo para Solar Propiedades...')

    // Verificar si ya existe el usuario
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = 'solar@propiedades.com'"
    )

    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario Solar Propiedades ya existe')
      console.log('   Email: solar@propiedades.com')
      console.log('   Password: solar123')
      return
    }

    // Crear hash de contraseña
    const passwordHash = await bcrypt.hash('solar123', 10)

    // Insertar usuario
    const result = await client.query(
      `INSERT INTO users (
        name, email, password_hash, phone, whatsapp, is_business, business_name, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, business_name`,
      [
        'Solar Propiedades',
        'solar@propiedades.com',
        passwordHash,
        '3425123456',
        '5493425123456',
        true,
        'Solar Propiedades',
        true
      ]
    )

    const user = result.rows[0]
    console.log('✅ Usuario creado exitosamente!')
    console.log('')
    console.log('📋 Credenciales de acceso:')
    console.log('   Email: solar@propiedades.com')
    console.log('   Password: solar123')
    console.log('   ID Usuario:', user.id)
    console.log('')
    console.log('🔗 Puedes iniciar sesión en: http://localhost:3000/login')
    console.log('   Luego ir a: http://localhost:3000/inmobiliaria-en-equipo')

  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

createSolarUser()




