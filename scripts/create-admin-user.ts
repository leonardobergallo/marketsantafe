// Script para crear un usuario administrador
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function createAdminUser() {
  const client = await pool.connect()

  try {
    console.log('👤 Creando usuario administrador...')

    // Datos del administrador (puedes modificar estos valores)
    const adminData = {
      name: 'Administrador',
      email: 'admin@marketsantafe.com',
      password: 'Admin123!', // Cambiar por una contraseña segura
      is_admin: true,
      is_business: false,
    }

    // Verificar si el email ya existe
    const existingUser = await client.query(
      'SELECT id, email, is_admin FROM users WHERE email = $1',
      [adminData.email]
    )

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0]
      if (user.is_admin) {
        console.log('⚠️  El usuario administrador ya existe')
        console.log(`   Email: ${user.email}`)
        console.log(`   ID: ${user.id}`)
        return
      } else {
        // Actualizar usuario existente a admin
        await client.query(
          'UPDATE users SET is_admin = TRUE WHERE id = $1',
          [user.id]
        )
        console.log('✅ Usuario actualizado a administrador')
        console.log(`   Email: ${user.email}`)
        console.log(`   ID: ${user.id}`)
        return
      }
    }

    // Hash del password
    const passwordHash = await hashPassword(adminData.password)

    // Insertar usuario administrador
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, is_admin, is_business, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, is_admin`,
      [
        adminData.name,
        adminData.email,
        passwordHash,
        adminData.is_admin,
        adminData.is_business,
        true, // verified por defecto true para admin
      ]
    )

    const admin = result.rows[0]

    console.log('✅ Usuario administrador creado exitosamente')
    console.log('')
    console.log('📋 Credenciales:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Password: ${adminData.password}`)
    console.log(`   ID: ${admin.id}`)
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión')
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
createAdminUser()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

