// Script para asignar plan premium a un usuario específico
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function assignPremiumPlan() {
  const client = await pool.connect()

  try {
    console.log('🎯 Asignando plan premium a usuario...\n')

    // Buscar usuario Solar Propiedades
    const userResult = await client.query(
      "SELECT id, name, email FROM users WHERE email = 'solar@propiedades.com' LIMIT 1"
    )

    if (userResult.rows.length === 0) {
      console.log('⚠️  Usuario Solar Propiedades no encontrado')
      console.log('   Buscando otros usuarios...\n')
      
      // Listar todos los usuarios
      const allUsers = await client.query(
        'SELECT id, name, email FROM users ORDER BY id'
      )
      
      console.log('Usuarios disponibles:')
      allUsers.rows.forEach((user: any) => {
        console.log(`   ID: ${user.id} | ${user.name} | ${user.email}`)
      })
      return
    }

    const user = userResult.rows[0]
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`)
    console.log(`   ID: ${user.id}\n`)

    // Asignar plan business-pro (el más completo)
    const planType = 'business-pro'
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1) // 1 año de suscripción

    // Verificar si ya tiene una suscripción activa
    const existingSub = await client.query(
      `SELECT id, plan_type, status FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    )

    if (existingSub.rows.length > 0) {
      // Actualizar suscripción existente
      await client.query(
        `UPDATE subscriptions 
         SET plan_type = $1, status = 'active', end_date = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [planType, endDate, existingSub.rows[0].id]
      )
      console.log(`✅ Suscripción actualizada a: ${planType}`)
    } else {
      // Crear nueva suscripción
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, auto_renew)
         VALUES ($1, $2, 'active', CURRENT_TIMESTAMP, $3, true)`,
        [user.id, planType, endDate]
      )
      console.log(`✅ Suscripción creada: ${planType}`)
    }

    // Actualizar plan del usuario
    await client.query(
      `UPDATE users 
       SET subscription_plan = $1, subscription_expires_at = $2
       WHERE id = $3`,
      [planType, endDate, user.id]
    )
    console.log(`✅ Plan del usuario actualizado: ${planType}`)

    console.log(`\n📋 Plan asignado: ${planType}`)
    console.log(`   Válido hasta: ${endDate.toLocaleDateString('es-AR')}`)
    console.log(`   Características:`)
    console.log(`   - Propiedades: Ilimitadas`)
    console.log(`   - Publicaciones: Ilimitadas`)
    console.log(`   - Productos: Ilimitados`)
    console.log(`   - Destacados: Sí`)

  } catch (error) {
    console.error('❌ Error asignando plan:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
assignPremiumPlan()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })


