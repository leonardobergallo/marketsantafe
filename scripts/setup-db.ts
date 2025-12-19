// Script para crear las tablas de la base de datos
// TypeScript: script de Node.js para setup inicial
// En JavaScript sería similar pero sin tipos

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log('🚀 Creando tablas de la base de datos...')

    // Tabla de zonas/barrios
    await client.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla zones creada')

    // Tabla de categorías del mercado
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla categories creada')

    // Tabla de usuarios (personas y negocios)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        phone VARCHAR(20),
        whatsapp VARCHAR(20),
        is_business BOOLEAN DEFAULT FALSE,
        business_name VARCHAR(200),
        avatar_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla users creada')
    
    // Migración: agregar campos si no existen (para bases de datos existentes)
    await client.query(`
      DO $$ 
      BEGIN
        -- Agregar password_hash si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password_hash'
        ) THEN
          ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        END IF;
        
        -- Agregar verified si no existe
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'verified'
        ) THEN
          ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `)
    console.log('✅ Campos de autenticación verificados/agregados')

    // Tabla de publicaciones del mercado
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(12, 2) DEFAULT 0,
        condition VARCHAR(20) CHECK (condition IN ('nuevo', 'usado', 'reacondicionado')),
        image_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla listings creada')

      // Tabla de restaurantes/locales gastronómicos
      await client.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          food_type VARCHAR(100),
          image_url TEXT,
          logo_url TEXT,
          address TEXT,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          phone VARCHAR(20),
          whatsapp VARCHAR(20),
          delivery BOOLEAN DEFAULT FALSE,
          pickup BOOLEAN DEFAULT TRUE,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)
    console.log('✅ Tabla restaurants creada')

    // Tabla de horarios de restaurantes
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_hours (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla restaurant_hours creada')

    // Tabla de platos/menús
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Tabla menu_items creada')

    // Índices para mejorar performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listings_zone ON listings(zone_id);
      CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
      CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
      CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
      CREATE INDEX IF NOT EXISTS idx_restaurants_zone ON restaurants(zone_id);
      CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(active);
      CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
    `)
    console.log('✅ Índices creados')

    console.log('🎉 Base de datos configurada correctamente!')
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos el setup
setupDatabase()
  .then(() => {
    console.log('✅ Setup completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el setup:', error)
    process.exit(1)
  })

