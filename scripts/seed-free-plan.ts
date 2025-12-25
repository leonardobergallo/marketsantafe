// Script para crear plan gratuito de lanzamiento
// Ejecutar con: npx tsx scripts/seed-free-plan.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function seedFreePlan() {
  const client = await pool.connect()

  try {
    console.log('🌱 Creando plan gratuito de lanzamiento...')

    // Verificar si el plan ya existe
    const existing = await client.query(
      'SELECT id FROM subscription_plans WHERE slug = $1',
      ['gratis-lanzamiento']
    )

    const plan = {
      name: 'Plan Gratuito - Lanzamiento',
      slug: 'gratis-lanzamiento',
      description: 'Plan especial de lanzamiento. Publicaciones ilimitadas durante el período promocional. ¡Aprovechá esta oportunidad única!',
      price: 0.00,
      currency: 'ARS',
      duration_days: 30, // 1 mes gratis
      max_listings: null, // Ilimitado
      features: [
        'Publicaciones ilimitadas',
        'Fotos por publicación: hasta 10',
        'Sin costo durante 1 mes',
        'Acceso completo a todas las funcionalidades',
        'Soporte por email',
        '⚠️ Oferta limitada - Solo para primeros usuarios'
      ],
      is_active: true
    }

    if (existing.rows.length > 0) {
      // Actualizar plan existente
      await client.query(
        `UPDATE subscription_plans 
         SET name = $1, description = $2, price = $3, currency = $4, 
             duration_days = $5, max_listings = $6, features = $7, 
             is_active = $8, updated_at = CURRENT_TIMESTAMP
         WHERE slug = $9`,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.currency,
          plan.duration_days,
          plan.max_listings,
          JSON.stringify(plan.features),
          plan.is_active,
          plan.slug
        ]
      )
      console.log(`✅ Plan "${plan.name}" actualizado`)
    } else {
      // Insertar nuevo plan
      await client.query(
        `INSERT INTO subscription_plans 
         (name, slug, description, price, currency, duration_days, max_listings, features, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          plan.name,
          plan.slug,
          plan.description,
          plan.price,
          plan.currency,
          plan.duration_days,
          plan.max_listings,
          JSON.stringify(plan.features),
          plan.is_active
        ]
      )
      console.log(`✅ Plan "${plan.name}" creado`)
    }

    console.log('✅ Plan gratuito de lanzamiento configurado')
  } catch (error) {
    console.error('❌ Error al crear plan gratuito:', error)
    throw error
  } finally {
    client.release()
  }
}

seedFreePlan()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

