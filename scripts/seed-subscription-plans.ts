// Script para crear planes de suscripción con precios
// Ejecutar con: npx tsx scripts/seed-subscription-plans.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

interface SubscriptionPlan {
  name: string
  slug: string
  description: string
  price: number
  currency: string
  duration_days: number
  max_listings: number | null
  features: string[]
  is_active: boolean
}

const plans: SubscriptionPlan[] = [
  {
    name: 'Plan Particular',
    slug: 'particular',
    description: 'Ideal para publicar productos de forma individual. Publicaciones ilimitadas durante el mes.',
    price: 5000.00, // $5,000 ARS por mes
    currency: 'ARS',
    duration_days: 30,
    max_listings: null, // Ilimitado
    features: [
      'Publicaciones ilimitadas',
      'Fotos por publicación: hasta 10',
      'Publicación destacada opcional (+$2,000)',
      'Soporte por email',
      'Renovación automática'
    ],
    is_active: true
  },
  {
    name: 'Plan Bar/Restaurante',
    slug: 'bar-restaurante',
    description: 'Perfecto para negocios gastronómicos. Publica tu menú, promociones y eventos especiales.',
    price: 15000.00, // $15,000 ARS por mes
    currency: 'ARS',
    duration_days: 30,
    max_listings: null, // Ilimitado
    features: [
      'Publicaciones ilimitadas',
      'Fotos por publicación: hasta 15',
      'Publicación destacada incluida',
      'Aparece en sección "Qué comer hoy"',
      'Badge de verificación',
      'Estadísticas de visualizaciones',
      'Soporte prioritario',
      'Renovación automática'
    ],
    is_active: true
  },
  {
    name: 'Plan Agente Inmobiliario',
    slug: 'agente-inmobiliario',
    description: 'Para agentes inmobiliarios profesionales. Acceso al panel de chatbot y gestión de leads.',
    price: 25000.00, // $25,000 ARS por mes
    currency: 'ARS',
    duration_days: 30,
    max_listings: null, // Ilimitado
    features: [
      'Publicaciones ilimitadas de propiedades',
      'Fotos por propiedad: hasta 20',
      'Publicación destacada incluida',
      'Acceso al panel de administración del chatbot',
      'Gestión de clientes potenciales (leads)',
      'Estadísticas avanzadas',
      'Badge "Agente Verificado"',
      'Aparece en sección "Inmobiliaria en Equipo"',
      'Soporte prioritario 24/7',
      'Renovación automática'
    ],
    is_active: true
  }
]

async function seedSubscriptionPlans() {
  const client = await pool.connect()

  try {
    console.log('🌱 Insertando planes de suscripción...')

    for (const plan of plans) {
      // Verificar si el plan ya existe
      const existing = await client.query(
        'SELECT id FROM subscription_plans WHERE slug = $1',
        [plan.slug]
      )

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
    }

    console.log('✅ Todos los planes de suscripción han sido creados/actualizados')
  } catch (error) {
    console.error('❌ Error al insertar planes:', error)
    throw error
  } finally {
    client.release()
  }
}

seedSubscriptionPlans()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

