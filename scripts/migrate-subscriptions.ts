// Script para crear tablas de suscripciones y planes
// Ejecutar con: npx tsx scripts/migrate-subscriptions.ts

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function migrateSubscriptions() {
  const client = await pool.connect()

  try {
    console.log('🔄 Creando tablas de suscripciones...')

    // Tabla de planes de suscripción
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'ARS',
        duration_days INTEGER NOT NULL DEFAULT 30,
        max_listings INTEGER DEFAULT NULL,
        features JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla subscription_plans creada')

    // Tabla de suscripciones de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP NOT NULL,
        auto_renew BOOLEAN DEFAULT TRUE,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
        CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
      );
    `)
    console.log('✅ Tabla user_subscriptions creada')

    // Índices para mejorar rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);
    `)
    console.log('✅ Índices creados')

    // Tabla de pagos (historial de pagos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'ARS',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        payment_date TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled'))
      );
    `)
    console.log('✅ Tabla payments creada')

    // Índices para payments
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
    `)
    console.log('✅ Índices de payments creados')

    console.log('✅ Migración de suscripciones completada')
  } catch (error) {
    console.error('❌ Error en la migración:', error)
    throw error
  } finally {
    client.release()
  }
}

migrateSubscriptions()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

