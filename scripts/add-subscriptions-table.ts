// Script para agregar tablas de suscripciones y pagos
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from './../lib/db'

config({ path: resolve(process.cwd(), '.env.local') })

async function addSubscriptionsTables() {
  const client = await pool.connect()
  try {
    console.log('🚀 Agregando tablas de suscripciones y pagos...')

    // Tabla de suscripciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'individual-premium', 'properties-premium', 'business-basic', 'business-pro')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        auto_renew BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla subscriptions creada')

    // Tabla de pagos
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'ARS',
        payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'transfer', 'mercadopago', 'whatsapp', 'manual')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
        payment_provider_id VARCHAR(255),
        payment_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla payments creada')
    
    // Verificar que la tabla se creó correctamente
    const checkTable = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
    `)
    console.log(`📋 Columnas en payments: ${checkTable.rows.map((r: any) => r.column_name).join(', ')}`)

    // Agregar campos a users si no existen
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_plan') THEN
          ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_expires_at') THEN
          ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;
        END IF;
      END
      $$;
    `)
    console.log('✅ Campos agregados a users')

    // Crear índices uno por uno para mejor manejo de errores
    const indexes = [
      { name: 'idx_subscriptions_user', query: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)' },
      { name: 'idx_subscriptions_status', query: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)' },
      { name: 'idx_payments_user', query: 'CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id)' },
      { name: 'idx_payments_subscription', query: 'CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id)' },
      { name: 'idx_payments_status', query: 'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status)' },
    ]

    for (const index of indexes) {
      try {
        await client.query(index.query)
        console.log(`✅ Índice ${index.name} creado`)
      } catch (error: any) {
        // Ignorar si el índice ya existe
        if (error.code !== '42P07') {
          console.log(`⚠️  No se pudo crear ${index.name}: ${error.message}`)
        }
      }
    }

    // Asignar plan free a todos los usuarios existentes
    await client.query(`
      UPDATE users 
      SET subscription_plan = 'free' 
      WHERE subscription_plan IS NULL;
    `)
    console.log('✅ Plan free asignado a usuarios existentes')

    console.log('🎉 Migración completada!')
  } catch (error) {
    console.error('❌ Error al agregar tablas:', error)
    throw error
  } finally {
    client.release()
  }
}

addSubscriptionsTables()
  .then(() => {
    console.log('✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en la migración:', error)
    process.exit(1)
  })

