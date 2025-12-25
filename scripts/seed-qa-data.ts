// Script completo para poblar la base de datos con datos de ejemplo para QA
// Ejecutar con: npx tsx scripts/seed-qa-data.ts
//
// Este script crea:
// - Usuarios de ejemplo (particular, negocio, agente inmobiliario)
// - Suscripciones para esos usuarios
// - Listings/productos de ejemplo
// - Restaurantes de ejemplo
// - Menús de ejemplo
// - Propiedades inmobiliarias de ejemplo

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function seedQAData() {
  const client = await pool.connect()

  try {
    console.log('🚀 Iniciando seed de datos de QA...\n')

    // ============================================
    // 1. OBTENER DATOS EXISTENTES
    // ============================================
    console.log('📋 Obteniendo datos existentes...')

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

    // Obtener categorías
    const categoriesResult = await client.query('SELECT id, slug FROM categories')
    const categoriesMap = new Map(categoriesResult.rows.map((c: any) => [c.slug, c.id]))

    // Obtener zonas
    const zonesResult = await client.query('SELECT id, slug FROM zones')
    const zonesMap = new Map(zonesResult.rows.map((z: any) => [z.slug, z.id]))

    console.log(`✅ Planes: ${Object.keys(plans).length}`)
    console.log(`✅ Categorías: ${categoriesMap.size}`)
    console.log(`✅ Zonas: ${zonesMap.size}\n`)

    // ============================================
    // 2. CREAR USUARIOS
    // ============================================
    console.log('👥 Creando usuarios de ejemplo...')

    const passwordHash = await hashPassword('password123') // Contraseña común para todos los usuarios de QA

    const users = [
      // Usuarios particulares
      {
        name: 'Juan Pérez',
        email: 'juan.perez@qa.test',
        phone: '3425123456',
        whatsapp: '3425123456',
        is_business: false,
        business_name: null,
        is_inmobiliaria_agent: false,
        planSlug: 'particular',
      },
      {
        name: 'María González',
        email: 'maria.gonzalez@qa.test',
        phone: '3425234567',
        whatsapp: '3425234567',
        is_business: false,
        business_name: null,
        is_inmobiliaria_agent: false,
        planSlug: 'particular',
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@qa.test',
        phone: '3425345678',
        whatsapp: '3425345678',
        is_business: false,
        business_name: null,
        is_inmobiliaria_agent: false,
        planSlug: 'particular',
      },
      // Usuarios de negocio
      {
        name: 'Pizzería El Buen Sabor',
        email: 'pizzeria@qa.test',
        phone: '3425456789',
        whatsapp: '3425456789',
        is_business: true,
        business_name: 'Pizzería El Buen Sabor',
        is_inmobiliaria_agent: false,
        planSlug: 'bar-restaurante',
      },
      {
        name: 'Restaurante La Esquina',
        email: 'restaurante@qa.test',
        phone: '3425567890',
        whatsapp: '3425567890',
        is_business: true,
        business_name: 'Restaurante La Esquina',
        is_inmobiliaria_agent: false,
        planSlug: 'bar-restaurante',
      },
      {
        name: 'Café Central',
        email: 'cafe@qa.test',
        phone: '3425678901',
        whatsapp: '3425678901',
        is_business: true,
        business_name: 'Café Central',
        is_inmobiliaria_agent: false,
        planSlug: 'bar-restaurante',
      },
      // Agentes inmobiliarios
      {
        name: 'Agente Inmobiliario Test',
        email: 'agente@qa.test',
        phone: '3425789012',
        whatsapp: '3425789012',
        is_business: false,
        business_name: null,
        is_inmobiliaria_agent: true,
        planSlug: 'agente-inmobiliario',
      },
      {
        name: 'Inmobiliaria Santa Fe',
        email: 'inmobiliaria@qa.test',
        phone: '3425890123',
        whatsapp: '3425890123',
        is_business: true,
        business_name: 'Inmobiliaria Santa Fe',
        is_inmobiliaria_agent: true,
        planSlug: 'agente-inmobiliario',
      },
    ]

    const createdUsers: any[] = []

    for (const userData of users) {
      // Verificar si el usuario ya existe
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [userData.email])
      
      if (existingUser.rows.length > 0) {
        console.log(`⏭️  Usuario ${userData.email} ya existe, usando existente`)
        const user = await client.query('SELECT id, name, email FROM users WHERE email = $1', [userData.email])
        createdUsers.push({ ...user.rows[0], ...userData })
        continue
      }

      // Crear usuario
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, phone, whatsapp, is_business, business_name, is_inmobiliaria_agent, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email`,
        [
          userData.name,
          userData.email,
          passwordHash,
          userData.phone,
          userData.whatsapp,
          userData.is_business,
          userData.business_name,
          userData.is_inmobiliaria_agent,
          true, // verified
        ]
      )

      const user = result.rows[0]
      createdUsers.push({ ...user, ...userData })
      console.log(`✅ Usuario creado: ${user.name} (${user.email})`)
    }

    console.log(`\n✅ ${createdUsers.length} usuarios listos\n`)

    // ============================================
    // 3. CREAR SUSCRIPCIONES
    // ============================================
    console.log('💳 Creando suscripciones...')

    for (const user of createdUsers) {
      const plan = plans[user.planSlug]
      if (!plan) {
        console.warn(`⚠️  Plan "${user.planSlug}" no encontrado para usuario ${user.email}`)
        continue
      }

      // Verificar si ya tiene suscripción activa
      const existingSub = await client.query(
        `SELECT id FROM user_subscriptions WHERE user_id = $1 AND status = 'active'`,
        [user.id]
      )

      if (existingSub.rows.length > 0) {
        console.log(`⏭️  Usuario ${user.email} ya tiene suscripción activa`)
        continue
      }

      // Calcular fechas (30 días desde hoy)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)

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
          'paid',
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
          'transferencia',
          startDate,
          startDate,
        ]
      )

      console.log(`✅ Suscripción creada para ${user.name} (${user.planSlug}) - $${plan.price}`)
    }

    console.log(`\n✅ Suscripciones creadas\n`)

    // ============================================
    // 4. CREAR LISTINGS/PRODUCTOS
    // ============================================
    console.log('📦 Creando listings de ejemplo...')

    const categoryIds = {
      'electronica': categoriesMap.get('electronica') || categoriesMap.values().next().value,
      'hogar': categoriesMap.get('hogar') || categoriesMap.values().next().value,
      'vehiculos': categoriesMap.get('vehiculos') || categoriesMap.values().next().value,
      'ropa': categoriesMap.get('ropa') || categoriesMap.values().next().value,
    }

    const zoneIds = {
      'centro': zonesMap.get('centro') || zonesMap.values().next().value,
      'barrio-norte': zonesMap.get('barrio-norte') || zonesMap.values().next().value,
      'barrio-sur': zonesMap.get('barrio-sur') || zonesMap.values().next().value,
    }

    const listings = [
      {
        title: 'iPhone 13 Pro Max 256GB',
        description: 'iPhone en excelente estado, con caja y cargador original. Pantalla perfecta, sin rayones.',
        price: 850000,
        condition: 'usado',
        categoryId: categoryIds.electronica,
        zoneId: zoneIds.centro,
        userId: createdUsers[0].id, // Juan Pérez
        featured: true,
      },
      {
        title: 'Sofá 3 cuerpos beige',
        description: 'Sofá cómodo y en buen estado. Ideal para living. Se retira por el domicilio.',
        price: 120000,
        condition: 'usado',
        categoryId: categoryIds.hogar,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[1].id, // María González
        featured: false,
      },
      {
        title: 'Bicicleta Mountain Bike',
        description: 'Bicicleta de montaña, 21 velocidades, frenos de disco. Perfecta para andar por la ciudad.',
        price: 95000,
        condition: 'usado',
        categoryId: categoryIds.vehiculos,
        zoneId: zoneIds.centro,
        userId: createdUsers[2].id, // Carlos Rodríguez
        featured: false,
      },
      {
        title: 'Notebook Dell Inspiron 15',
        description: 'Notebook Dell, Intel i5, 8GB RAM, 256GB SSD. Excelente para trabajo y estudio.',
        price: 350000,
        condition: 'usado',
        categoryId: categoryIds.electronica,
        zoneId: zoneIds['barrio-sur'],
        userId: createdUsers[0].id,
        featured: false,
      },
      {
        title: 'Zapatillas Nike Air Max',
        description: 'Zapatillas Nike Air Max, talle 42, usadas pero en buen estado.',
        price: 45000,
        condition: 'usado',
        categoryId: categoryIds.ropa,
        zoneId: zoneIds.centro,
        userId: createdUsers[1].id,
        featured: false,
      },
    ]

    for (const listing of listings) {
      await client.query(
        `INSERT INTO listings 
         (title, description, price, condition, category_id, zone_id, user_id, featured, active, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          listing.title,
          listing.description,
          listing.price,
          listing.condition,
          listing.categoryId,
          listing.zoneId,
          listing.userId,
          listing.featured,
          true, // active
          'ARS',
        ]
      )
      console.log(`✅ Listing creado: ${listing.title}`)
    }

    console.log(`\n✅ ${listings.length} listings creados\n`)

    // ============================================
    // 5. CREAR PROPIEDADES INMOBILIARIAS
    // ============================================
    console.log('🏠 Creando propiedades inmobiliarias...')

    // Categorías de inmobiliaria (Alquileres e Inmuebles)
    const alquileresCategoryId = categoriesMap.get('alquileres') || categoriesMap.values().next().value
    const inmueblesCategoryId = categoriesMap.get('inmuebles') || categoriesMap.values().next().value

    const properties = [
      // ALQUILERES
      {
        title: 'Departamento 2 ambientes en Centro',
        description: 'Departamento luminoso, 2 ambientes, cocina integrada, balcón. Excelente ubicación en el centro de Santa Fe. Expensas incluidas.',
        price: 150000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[6].id, // Agente Inmobiliario
        featured: true,
      },
      {
        title: 'Casa 3 dormitorios en Barrio Norte',
        description: 'Casa amplia, 3 dormitorios, patio, cochera. Ideal para familia. Todos los servicios.',
        price: 250000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[7].id, // Inmobiliaria Santa Fe
        featured: false,
      },
      {
        title: 'Departamento 1 ambiente en Centro',
        description: 'Monoambiente moderno, totalmente equipado. Ideal para estudiantes o profesionales. Incluye servicios.',
        price: 120000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[6].id,
        featured: false,
      },
      {
        title: 'Casa 4 dormitorios con piscina',
        description: 'Hermosa casa con 4 dormitorios, 2 baños, cocina amplia, living comedor, patio con piscina y parrilla. Zona residencial tranquila.',
        price: 350000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[7].id,
        featured: true,
      },
      {
        title: 'Local comercial en Centro',
        description: 'Local comercial de 80m² en pleno centro, ideal para negocio. Excelente ubicación con mucho tránsito.',
        price: 180000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[6].id,
        featured: false,
      },
      {
        title: 'Departamento 3 ambientes en Barrio Sur',
        description: 'Departamento cómodo, 3 ambientes, 2 dormitorios, balcón. Cerca de escuelas y comercios.',
        price: 200000,
        condition: null,
        categoryId: alquileresCategoryId,
        zoneId: zoneIds['barrio-sur'],
        userId: createdUsers[7].id,
        featured: false,
      },
      // VENTAS (INMUEBLES)
      {
        title: 'Terreno 500m² en Barrio Sur',
        description: 'Terreno plano, listo para construir. Excelente ubicación, servicios disponibles. Escritura al día.',
        price: 3500000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds['barrio-sur'],
        userId: createdUsers[6].id,
        featured: true,
      },
      {
        title: 'Casa en venta 3 dormitorios',
        description: 'Casa para estrenar, 3 dormitorios, 2 baños, cocina moderna, patio con parrilla. Excelente estado.',
        price: 85000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[7].id,
        featured: true,
      },
      {
        title: 'Departamento 2 ambientes en venta',
        description: 'Departamento en excelente estado, 2 ambientes, cocina integrada, balcón. Ubicación privilegiada.',
        price: 45000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[6].id,
        featured: false,
      },
      {
        title: 'Terreno 300m² en Centro',
        description: 'Terreno céntrico, ideal para construcción o inversión. Todos los servicios, escritura lista.',
        price: 28000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[7].id,
        featured: false,
      },
      {
        title: 'Casa 5 dormitorios con quincho',
        description: 'Casa amplia, 5 dormitorios, 3 baños, cocina grande, living, comedor, quincho con parrilla y piscina. Ideal para familia numerosa.',
        price: 120000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[6].id,
        featured: true,
      },
      {
        title: 'Local comercial en venta',
        description: 'Local comercial de 120m² en zona comercial, excelente para negocio. Incluye depósito.',
        price: 55000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[7].id,
        featured: false,
      },
      {
        title: 'Terreno 800m² en Barrio Norte',
        description: 'Terreno amplio, plano, con árboles. Ideal para construir casa grande. Servicios disponibles.',
        price: 42000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds['barrio-norte'],
        userId: createdUsers[6].id,
        featured: false,
      },
      {
        title: 'Departamento 3 ambientes en venta',
        description: 'Departamento moderno, 3 ambientes, 2 dormitorios, cocina integrada, balcón. Edificio con seguridad.',
        price: 65000000,
        condition: null,
        categoryId: inmueblesCategoryId,
        zoneId: zoneIds.centro,
        userId: createdUsers[7].id,
        featured: true,
      },
    ]

    for (const property of properties) {
      await client.query(
        `INSERT INTO listings 
         (title, description, price, condition, category_id, zone_id, user_id, featured, active, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          property.title,
          property.description,
          property.price,
          property.condition,
          property.categoryId,
          property.zoneId,
          property.userId,
          property.featured,
          true,
          'ARS',
        ]
      )
      console.log(`✅ Propiedad creada: ${property.title}`)
    }

    console.log(`\n✅ ${properties.length} propiedades creadas\n`)

    // ============================================
    // 6. CREAR RESTAURANTES
    // ============================================
    console.log('🍔 Creando restaurantes...')

    const restaurantUsers = createdUsers.filter(u => u.is_business && u.planSlug === 'bar-restaurante')

    if (restaurantUsers.length > 0) {
      const restaurants = [
        {
          name: 'Pizzería El Buen Sabor',
          description: 'Las mejores pizzas de Santa Fe, hechas con ingredientes frescos y masa casera.',
          food_type: 'Pizza',
          zone_id: zoneIds.centro,
          address: 'San Martín 2500, Centro',
          latitude: -31.6333,
          longitude: -60.7000,
          phone: '3425345678',
          whatsapp: '3425345678',
          delivery: true,
          pickup: true,
          user_id: restaurantUsers[0]?.id,
        },
        {
          name: 'Restaurante La Esquina',
          description: 'Comida casera y platos del día. Ambiente familiar, ideal para almorzar o cenar.',
          food_type: 'Comida Casera',
          zone_id: zoneIds['barrio-norte'],
          address: 'Av. Freyre 3200, Barrio Norte',
          latitude: -31.6200,
          longitude: -60.7100,
          phone: '3425456789',
          whatsapp: '3425456789',
          delivery: true,
          pickup: true,
          user_id: restaurantUsers[1]?.id,
        },
        {
          name: 'Café Central',
          description: 'Café de especialidad, medialunas recién horneadas y desayunos completos.',
          food_type: 'Cafetería',
          zone_id: zoneIds.centro,
          address: 'Rivadavia 2700, Centro',
          latitude: -31.6320,
          longitude: -60.7020,
          phone: '3425678901',
          whatsapp: '3425678901',
          delivery: true,
          pickup: true,
          user_id: restaurantUsers[2]?.id,
        },
      ]

      const createdRestaurants: any[] = []

      for (const restaurant of restaurants) {
        if (!restaurant.user_id) continue

        // Verificar si ya existe
        const existing = await client.query(
          'SELECT id FROM restaurants WHERE user_id = $1',
          [restaurant.user_id]
        )

        if (existing.rows.length > 0) {
          console.log(`⏭️  Restaurante para usuario ${restaurant.user_id} ya existe`)
          continue
        }

        const result = await client.query(
          `INSERT INTO restaurants 
           (name, description, food_type, zone_id, address, latitude, longitude, phone, whatsapp, delivery, pickup, user_id, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id, name`,
          [
            restaurant.name,
            restaurant.description,
            restaurant.food_type,
            restaurant.zone_id,
            restaurant.address,
            restaurant.latitude,
            restaurant.longitude,
            restaurant.phone,
            restaurant.whatsapp,
            restaurant.delivery,
            restaurant.pickup,
            restaurant.user_id,
            true, // active
          ]
        )

        createdRestaurants.push(result.rows[0])
        console.log(`✅ Restaurante creado: ${result.rows[0].name}`)
      }

      // ============================================
      // 7. CREAR MENÚS
      // ============================================
      console.log('\n🍽️  Creando menús...')

      const menuItems = [
        // Menú para Pizzería El Buen Sabor
        {
          restaurant_id: createdRestaurants[0]?.id,
          name: 'Pizza Muzzarella',
          description: 'Pizza clásica con muzzarella y salsa de tomate',
          price: 3500,
          available: true,
        },
        {
          restaurant_id: createdRestaurants[0]?.id,
          name: 'Pizza Napolitana',
          description: 'Pizza con muzzarella, tomate, ajo y albahaca',
          price: 4200,
          available: true,
        },
        {
          restaurant_id: createdRestaurants[0]?.id,
          name: 'Pizza Especial',
          description: 'Pizza con jamón, morrones, huevo y aceitunas',
          price: 4800,
          available: true,
        },
        // Menú para Restaurante La Esquina
        {
          restaurant_id: createdRestaurants[1]?.id,
          name: 'Milanesa con papas',
          description: 'Milanesa de carne con papas fritas',
          price: 4500,
          available: true,
        },
        {
          restaurant_id: createdRestaurants[1]?.id,
          name: 'Pollo al horno',
          description: 'Pollo al horno con ensalada',
          price: 5000,
          available: true,
        },
        // Menú para Café Central
        {
          restaurant_id: createdRestaurants[2]?.id,
          name: 'Café con leche',
          description: 'Café con leche caliente',
          price: 800,
          available: true,
        },
        {
          restaurant_id: createdRestaurants[2]?.id,
          name: 'Medialunas',
          description: 'Medialunas dulces recién horneadas',
          price: 600,
          available: true,
        },
        {
          restaurant_id: createdRestaurants[2]?.id,
          name: 'Tostado mixto',
          description: 'Tostado de jamón y queso',
          price: 1200,
          available: true,
        },
      ]

      for (const item of menuItems) {
        if (!item.restaurant_id) continue

        await client.query(
          `INSERT INTO menu_items 
           (restaurant_id, name, description, price, available)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            item.restaurant_id,
            item.name,
            item.description,
            item.price,
            item.available,
          ]
        )
        console.log(`✅ Item de menú creado: ${item.name}`)
      }

      console.log(`\n✅ ${menuItems.length} items de menú creados\n`)
    }

    // ============================================
    // RESUMEN
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('✅ SEED DE QA COMPLETADO')
    console.log('='.repeat(50))
    console.log(`\n📊 Resumen:`)
    console.log(`   👥 Usuarios: ${createdUsers.length}`)
    console.log(`   💳 Suscripciones: ${createdUsers.length}`)
    console.log(`   📦 Listings: ${listings.length}`)
    console.log(`   🏠 Propiedades: ${properties.length} (${properties.filter(p => p.categoryId === alquileresCategoryId).length} alquileres, ${properties.filter(p => p.categoryId === inmueblesCategoryId).length} ventas)`)
    console.log(`   🍔 Restaurantes: ${restaurantUsers.length > 0 ? '3' : '0'}`)
    console.log(`\n🔑 Credenciales de acceso (todos con contraseña: password123):`)
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`)
    })
    console.log('\n')

  } catch (error) {
    console.error('❌ Error al crear datos de QA:', error)
    throw error
  } finally {
    client.release()
  }
}

seedQAData()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

