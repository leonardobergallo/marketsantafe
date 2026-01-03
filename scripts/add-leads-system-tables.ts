// Script para crear tablas del sistema de leads/wizard multi-tenant
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addLeadsSystemTables() {
  const client = await pool.connect()

  try {
    console.log('🚀 Creando tablas del sistema de leads/wizard...\n')

    // 1. Tabla tenants (inmobiliarias)
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        email VARCHAR(255),
        whatsapp VARCHAR(20),
        logo_url TEXT,
        domain VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla tenants creada')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
      CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(active);
    `)
    console.log('✅ Índices de tenants creados')

    // 2. Tabla users (extender la existente o crear roles)
    // Verificamos si existe la columna role en users
    const checkRoleColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `)

    if (checkRoleColumn.rows.length === 0) {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
        ADD COLUMN role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('market_admin', 'tenant_admin', 'tenant_agent', 'user'));
      `)
      console.log('✅ Columnas tenant_id y role agregadas a users')
    } else {
      // Si role existe, solo agregar tenant_id si no existe
      const checkTenantIdColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tenant_id'
      `)
      if (checkTenantIdColumn.rows.length === 0) {
        await client.query(`
          ALTER TABLE users 
          ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
        `)
        console.log('✅ Columna tenant_id agregada a users')
      }
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)
    console.log('✅ Índices de users creados')

    // 3. Extender properties para asegurar tenant_id
    const checkPropertyTenantId = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'tenant_id'
    `)
    if (checkPropertyTenantId.rows.length === 0) {
      await client.query(`
        ALTER TABLE properties 
        ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
      `)
      console.log('✅ Columna tenant_id agregada a properties')
      
      // Migrar: asignar propiedades existentes al tenant del usuario propietario
      await client.query(`
        UPDATE properties p
        SET tenant_id = u.tenant_id
        FROM users u
        WHERE p.user_id = u.id AND u.tenant_id IS NOT NULL;
      `)
      console.log('✅ Propiedades migradas a tenant_id')
    }

    // 4. Tabla leads
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        flow_type VARCHAR(50) NOT NULL CHECK (flow_type IN ('ALQUILAR', 'COMPRAR', 'VENDER', 'TASACION', 'CONTACTO')),
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller')),
        source VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'new', 'contacted', 'qualified', 'closed', 'discarded')),
        
        -- Datos de contacto
        name VARCHAR(200),
        email VARCHAR(255),
        whatsapp VARCHAR(20),
        
        -- Datos del formulario (según flow_type)
        zone VARCHAR(200),
        property_type VARCHAR(100),
        budget_min DECIMAL(12, 2),
        budget_max DECIMAL(12, 2),
        budget DECIMAL(12, 2),
        bedrooms INTEGER,
        area_m2 DECIMAL(10, 2),
        condition VARCHAR(50),
        address TEXT,
        
        -- Metadata
        assigned_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP
      );
    `)
    console.log('✅ Tabla leads creada')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_flow_type ON leads(flow_type);
      CREATE INDEX IF NOT EXISTS idx_leads_user_type ON leads(user_type);
      CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
      CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to_user_id);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
    `)
    console.log('✅ Índices de leads creados')

    // 5. Tabla lead_steps (para autosave y reanudación)
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_steps (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        step_key VARCHAR(100) NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(lead_id, step_key)
      );
    `)
    console.log('✅ Tabla lead_steps creada')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_lead_steps_lead_id ON lead_steps(lead_id);
      CREATE INDEX IF NOT EXISTS idx_lead_steps_step_key ON lead_steps(step_key);
    `)
    console.log('✅ Índices de lead_steps creados')

    // 6. Tabla notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        payload JSONB,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla notifications creada')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `)
    console.log('✅ Índices de notifications creados')

    // 7. Crear tenant por defecto "Marketplace" si no existe
    const checkMarketTenant = await client.query(`
      SELECT id FROM tenants WHERE slug = 'marketplace' LIMIT 1
    `)
    if (checkMarketTenant.rows.length === 0) {
      await client.query(`
        INSERT INTO tenants (name, slug, email, active)
        VALUES ('Marketplace', 'marketplace', 'admin@marketsantafe.com', true)
        RETURNING id
      `)
      console.log('✅ Tenant "Marketplace" creado')
    }

    console.log('\n🎉 Tablas del sistema de leads creadas exitosamente!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addLeadsSystemTables()
  .then(() => {
    console.log('\n✅ Migración completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


