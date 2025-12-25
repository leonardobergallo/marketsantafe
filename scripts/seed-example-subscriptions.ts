// Script para crear suscripciones de ejemplo para usuarios
// Ejecutar con: npx tsx scripts/seed-example-subscriptions.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function seedExampleSubscriptions() {
  const client = await pool.connect()

  try {
    console.log('🌱 Creando suscripciones de ejemplo...')

    // Obtener planes
    const plansResult = await client.query('SELECT id, slug, price FROM subscription_plans WHERE is_active = true')
    const plans = plansResult.rows.reduce((acc, plan) => {
      acc[plan.slug] = plan
      return acc
    }, {} as Record<string, any>)

    if (Object.keys(plans).length === 0) {
      console.error('❌ No se encontraron planes activos. Ejecutá primero: npx tsx scripts/seed-subscription-plans.ts')
      return
    }

    // Obtener algunos usuarios existentes
    const usersResult = await client.query(`
      SELECT id, name, email, is_business, is_inmobiliaria_agent 
      FROM users 
      ORDER BY id 
      LIMIT 10
    `)

    if (usersResult.rows.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos. Creá algunos usuarios primero.')
      return
    }

    const users = usersResult.rows
    console.log(`📋 Encontrados ${users.length} usuarios`)

    // Crear suscripciones de ejemplo
    const subscriptions = []

    for (const user of users) {
      let planSlug = 'particular' // Por defecto
      
      // Asignar plan según el tipo de usuario
      if (user.is_inmobiliaria_agent) {
        planSlug = 'agente-inmobiliario'
      } else if (user.is_business) {
        planSlug = 'bar-restaurante'
      }

      const plan = plans[planSlug]
      if (!plan) {
        console.warn(`⚠️  Plan "${planSlug}" no encontrado para usuario ${user.id}`)
        continue
      }

      // Calcular fechas
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30) // 30 días

      // Verificar si ya tiene una suscripción activa
      const existingSub = await client.query(
        `SELECT id FROM user_subscriptions 
         WHERE user_id = $1 AND status = 'active'`,
        [user.id]
      )

      if (existingSub.rows.length > 0) {
        console.log(`⏭️  Usuario ${user.id} (${user.name}) ya tiene una suscripción activa`)
        continue
      }

      // Crear suscripción
      const subResult = await client.query(
        `INSERT INTO user_subscriptions 
         (user_id, plan_id, status, start_date, end_date, auto_renew, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          user.id,
          plan.id,
          'active',
          startDate,
          endDate,
          true,
          'paid' // Ejemplo: ya pagado
        ]
      )

      const subscriptionId = subResult.rows[0].id

      // Crear pago asociado
      await client.query(
        `INSERT INTO payments 
         (subscription_id, amount, currency, status, payment_method, payment_date, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          subscriptionId,
          plan.price,
          'ARS',
          'paid',
          'transferencia', // Ejemplo
          startDate,
          startDate
        ]
      )

      subscriptions.push({
        userId: user.id,
        userName: user.name,
        planName: planSlug,
        price: plan.price
      })

      console.log(`✅ Suscripción creada para ${user.name} (${planSlug}) - $${plan.price}`)
    }

    console.log(`\n✅ ${subscriptions.length} suscripciones de ejemplo creadas:`)
    subscriptions.forEach(sub => {
      console.log(`   - ${sub.userName}: ${sub.planName} - $${sub.price}`)
    })

  } catch (error) {
    console.error('❌ Error al crear suscripciones:', error)
    throw error
  } finally {
    client.release()
  }
}

seedExampleSubscriptions()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

