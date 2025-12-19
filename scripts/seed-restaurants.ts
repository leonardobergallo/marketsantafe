// Script para poblar restaurantes con datos de ejemplo y coordenadas
// TypeScript: script para insertar restaurantes con ubicaciones reales de Santa Fe
// En JavaScript sería similar pero sin tipos

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function seedRestaurants() {
  const client = await pool.connect()

  try {
    console.log('🍔 Poblando restaurantes con datos de ejemplo...')

    // Obtener IDs de zonas y usuarios
    const zonesResult = await client.query('SELECT id, slug FROM zones')
    const zonesMap = new Map(zonesResult.rows.map((z: any) => [z.slug, z.id]))

    const usersResult = await client.query('SELECT id FROM users WHERE is_business = true')
    const businessUserIds = usersResult.rows.map((u: any) => u.id)

    // Si no hay usuarios de negocio, crear algunos
    let userIds = [...businessUserIds]
    if (userIds.length < 10) {
      const newUsers = [
        { name: 'Pizzería El Buen Sabor', phone: '3425345678', whatsapp: '3425345678' },
        { name: 'Restaurante La Esquina', phone: '3425456789', whatsapp: '3425456789' },
        { name: 'Sushi Bar Tokio', phone: '3425567890', whatsapp: '3425567890' },
        { name: 'Parrilla Don Juan', phone: '3425678901', whatsapp: '3425678901' },
        { name: 'Café Central', phone: '3425789012', whatsapp: '3425789012' },
        { name: 'Heladería La Italiana', phone: '3425890123', whatsapp: '3425890123' },
        { name: 'Empanadas El Rincón', phone: '3425901234', whatsapp: '3425901234' },
        { name: 'Hamburguesería The Burger', phone: '3425012345', whatsapp: '3425012345' },
        { name: 'Pasta Fresca', phone: '3425123456', whatsapp: '3425123456' },
        { name: 'Tacos y Más', phone: '3425234567', whatsapp: '3425234567' },
      ]

      for (const user of newUsers.slice(userIds.length)) {
        const result = await client.query(
          `INSERT INTO users (name, phone, whatsapp, is_business, business_name) 
           VALUES ($1, $2, $3, true, $1) 
           RETURNING id`,
          [user.name, user.phone, user.whatsapp]
        )
        userIds.push(result.rows[0].id)
      }
    }

    // Restaurantes con coordenadas reales de Santa Fe Capital
    // Coordenadas aproximadas de diferentes zonas
    const restaurants = [
      {
        name: 'Pizzería El Buen Sabor',
        description: 'Las mejores pizzas de Santa Fe, hechas con ingredientes frescos y masa casera. Ambiente familiar y cálido.',
        food_type: 'Pizza',
        zone_slug: 'centro',
        address: 'San Martín 2500, Centro',
        latitude: -31.6333,
        longitude: -60.7000,
        phone: '3425345678',
        whatsapp: '3425345678',
        delivery: true,
        pickup: true,
        user_index: 0,
      },
      {
        name: 'Restaurante La Esquina',
        description: 'Comida casera y platos del día. Ambiente familiar, ideal para almorzar o cenar con amigos.',
        food_type: 'Comida Casera',
        zone_slug: 'barrio-norte',
        address: 'Av. Freyre 3200, Barrio Norte',
        latitude: -31.6200,
        longitude: -60.7100,
        phone: '3425456789',
        whatsapp: '3425456789',
        delivery: true,
        pickup: true,
        user_index: 1,
      },
      {
        name: 'Sushi Bar Tokio',
        description: 'Sushi fresco y auténtico. Rollos artesanales y platos japoneses tradicionales.',
        food_type: 'Sushi',
        zone_slug: 'centro',
        address: '25 de Mayo 2800, Centro',
        latitude: -31.6350,
        longitude: -60.6950,
        phone: '3425567890',
        whatsapp: '3425567890',
        delivery: true,
        pickup: true,
        user_index: 2,
      },
      {
        name: 'Parrilla Don Juan',
        description: 'Carnes a la parrilla, asados y platos típicos argentinos. La mejor carne de la ciudad.',
        food_type: 'Parrilla',
        zone_slug: 'san-martin',
        address: 'San Martín 1800, San Martín',
        latitude: -31.6400,
        longitude: -60.6900,
        phone: '3425678901',
        whatsapp: '3425678901',
        delivery: false,
        pickup: true,
        user_index: 3,
      },
      {
        name: 'Café Central',
        description: 'Café de especialidad, medialunas recién horneadas y desayunos completos. Ambiente acogedor.',
        food_type: 'Cafetería',
        zone_slug: 'centro',
        address: 'Rivadavia 2700, Centro',
        latitude: -31.6320,
        longitude: -60.7020,
        phone: '3425789012',
        whatsapp: '3425789012',
        delivery: true,
        pickup: true,
        user_index: 4,
      },
      {
        name: 'Heladería La Italiana',
        description: 'Helados artesanales con más de 50 sabores. Postres y tortas heladas.',
        food_type: 'Heladería',
        zone_slug: 'barrio-sur',
        address: 'Av. Belgrano 2100, Barrio Sur',
        latitude: -31.6450,
        longitude: -60.7050,
        phone: '3425890123',
        whatsapp: '3425890123',
        delivery: true,
        pickup: true,
        user_index: 5,
      },
      {
        name: 'Empanadas El Rincón',
        description: 'Empanadas caseras al horno y fritas. Más de 15 variedades diferentes.',
        food_type: 'Empanadas',
        zone_slug: 'candioti',
        address: 'Candioti 1500, Candioti',
        latitude: -31.6250,
        longitude: -60.6800,
        phone: '3425901234',
        whatsapp: '3425901234',
        delivery: true,
        pickup: true,
        user_index: 6,
      },
      {
        name: 'Hamburguesería The Burger',
        description: 'Hamburguesas gourmet con ingredientes premium. Papas fritas artesanales.',
        food_type: 'Hamburguesas',
        zone_slug: 'barrio-norte',
        address: 'Freyre 3500, Barrio Norte',
        latitude: -31.6180,
        longitude: -60.7120,
        phone: '3425012345',
        whatsapp: '3425012345',
        delivery: true,
        pickup: true,
        user_index: 7,
      },
      {
        name: 'Pasta Fresca',
        description: 'Pastas caseras, ravioles, ñoquis y lasañas. Recetas tradicionales italianas.',
        food_type: 'Pastas',
        zone_slug: 'villa-maria-selva',
        address: 'Av. López y Planes 2800, Villa María Selva',
        latitude: -31.6100,
        longitude: -60.6900,
        phone: '3425123456',
        whatsapp: '3425123456',
        delivery: true,
        pickup: true,
        user_index: 8,
      },
      {
        name: 'Tacos y Más',
        description: 'Comida mexicana auténtica. Tacos, burritos, quesadillas y más.',
        food_type: 'Mexicana',
        zone_slug: 'centro',
        address: 'San Martín 2600, Centro',
        latitude: -31.6340,
        longitude: -60.6980,
        phone: '3425234567',
        whatsapp: '3425234567',
        delivery: true,
        pickup: true,
        user_index: 9,
      },
    ]

    const restaurantIds: number[] = []

    for (const restaurant of restaurants) {
      const result = await client.query(
        `INSERT INTO restaurants (user_id, zone_id, name, description, food_type, address, latitude, longitude, phone, whatsapp, delivery, pickup)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          userIds[restaurant.user_index],
          zonesMap.get(restaurant.zone_slug),
          restaurant.name,
          restaurant.description,
          restaurant.food_type,
          restaurant.address,
          restaurant.latitude,
          restaurant.longitude,
          restaurant.phone,
          restaurant.whatsapp,
          restaurant.delivery,
          restaurant.pickup,
        ]
      )

      if (result.rows.length > 0) {
        restaurantIds.push(result.rows[0].id)
      }
    }
    console.log(`✅ ${restaurantIds.length} restaurantes insertados`)

    // Insertar horarios (Lunes a Viernes, 12:00 - 15:00 y 19:00 - 23:00)
    for (const restaurantId of restaurantIds) {
      for (let day = 0; day < 5; day++) {
        // Almuerzo
        await client.query(
          `INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [restaurantId, day, '12:00', '15:00']
        )
        // Cena
        await client.query(
          `INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [restaurantId, day, '19:00', '23:00']
        )
      }
    }
    console.log('✅ Horarios insertados')

    // Insertar platos de ejemplo para cada restaurante
    const menuItemsByRestaurant: Record<number, any[]> = {
      0: [
        { name: 'Pizza Muzzarella', description: 'Pizza clásica con muzzarella y salsa de tomate', price: 3500 },
        { name: 'Pizza Napolitana', description: 'Pizza con muzzarella, tomate y albahaca', price: 4200 },
        { name: 'Pizza Especial', description: 'Pizza con jamón, morrones y aceitunas', price: 4800 },
      ],
      1: [
        { name: 'Milanesa con papas', description: 'Milanesa de carne con papas fritas', price: 4500 },
        { name: 'Ensalada César', description: 'Ensalada fresca con pollo, crutones y aderezo césar', price: 3800 },
        { name: 'Ravioles con salsa', description: 'Ravioles caseros con salsa bolognesa', price: 4200 },
      ],
      2: [
        { name: 'Roll California', description: 'Roll con palta, pepino y cangrejo', price: 2800 },
        { name: 'Roll Philadelphia', description: 'Roll con salmón y queso crema', price: 3200 },
        { name: 'Sashimi Mix', description: 'Variedad de sashimi fresco', price: 4500 },
      ],
    }

    for (let i = 0; i < restaurantIds.length; i++) {
      const restaurantId = restaurantIds[i]
      const items = menuItemsByRestaurant[i] || [
        { name: 'Plato del día', description: 'Especialidad de la casa', price: 4000 },
      ]

      for (const item of items) {
        await client.query(
          `INSERT INTO menu_items (restaurant_id, name, description, price)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [restaurantId, item.name, item.description, item.price]
        )
      }
    }
    console.log('✅ Platos insertados')

    console.log('🎉 Restaurantes poblados correctamente!')
  } catch (error) {
    console.error('❌ Error al poblar restaurantes:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos el seed
seedRestaurants()
  .then(() => {
    console.log('✅ Seed de restaurantes completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el seed:', error)
    process.exit(1)
  })


