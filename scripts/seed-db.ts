// Script para poblar la base de datos con datos iniciales
// TypeScript: script para insertar datos de ejemplo
// En JavaScript sería similar pero sin tipos

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function seedDatabase() {
  const client = await pool.connect()

  try {
    console.log('🌱 Poblando base de datos con datos iniciales...')

    // Insertar zonas
    const zones = [
      { name: 'Centro', slug: 'centro' },
      { name: 'Barrio Sur', slug: 'barrio-sur' },
      { name: 'Barrio Norte', slug: 'barrio-norte' },
      { name: 'San Martín', slug: 'san-martin' },
      { name: 'Villa María Selva', slug: 'villa-maria-selva' },
      { name: 'Barranquitas', slug: 'barranquitas' },
      { name: 'San Agustín', slug: 'san-agustin' },
      { name: 'Candioti', slug: 'candioti' },
      { name: '7 Jefes', slug: '7-jefes' },
      { name: 'Alto Verde', slug: 'alto-verde' },
      { name: 'Guadalupe', slug: 'guadalupe' },
      { name: 'Santo Tomé', slug: 'santo-tome' },
    ]

    for (const zone of zones) {
      await client.query(
        `INSERT INTO zones (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [zone.name, zone.slug]
      )
    }
    console.log('✅ Zonas insertadas')

    // Insertar categorías
    const categories = [
      { name: 'Alquileres', slug: 'alquileres', icon: 'Home' },
      { name: 'Inmuebles', slug: 'inmuebles', icon: 'Building2' },
      { name: 'Vehículos', slug: 'vehiculos', icon: 'Car' },
      { name: 'Tecnología', slug: 'tecnologia', icon: 'Laptop' },
      { name: 'Hogar y Muebles', slug: 'hogar-muebles', icon: 'Sofa' },
      { name: 'Servicios', slug: 'servicios', icon: 'Wrench' },
      { name: 'Electrodomésticos', slug: 'electrodomesticos', icon: 'Microwave' },
      { name: 'Ropa y Accesorios', slug: 'ropa-accesorios', icon: 'Shirt' },
      { name: 'Deportes', slug: 'deportes', icon: 'Dumbbell' },
      { name: 'Mascotas', slug: 'mascotas', icon: 'Dog' },
      { name: 'Emprendedores', slug: 'emprendedores', icon: 'Store' },
    ]

    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [category.name, category.slug, category.icon]
      )
    }
    console.log('✅ Categorías insertadas')

    // Insertar usuarios de ejemplo
    const users = [
      {
        name: 'Juan Pérez',
        phone: '3425123456',
        whatsapp: '3425123456',
        is_business: false,
      },
      {
        name: 'María González',
        phone: '3425234567',
        whatsapp: '3425234567',
        is_business: false,
      },
      {
        name: 'Pizzería El Buen Sabor',
        phone: '3425345678',
        whatsapp: '3425345678',
        is_business: true,
        business_name: 'Pizzería El Buen Sabor',
      },
      {
        name: 'Restaurante La Esquina',
        phone: '3425456789',
        whatsapp: '3425456789',
        is_business: true,
        business_name: 'Restaurante La Esquina',
      },
    ]

    const userIds: number[] = []
    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (name, phone, whatsapp, is_business, business_name) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [user.name, user.phone, user.whatsapp, user.is_business, user.business_name || null]
      )
      userIds.push(result.rows[0].id)
    }
    console.log('✅ Usuarios insertados')

    // Obtener IDs de zonas y categorías
    const zonesResult = await client.query('SELECT id, slug FROM zones')
    const zonesMap = new Map(zonesResult.rows.map((z: any) => [z.slug, z.id]))

    const categoriesResult = await client.query('SELECT id, slug FROM categories')
    const categoriesMap = new Map(categoriesResult.rows.map((c: any) => [c.slug, c.id]))

    // Insertar publicaciones de ejemplo
    const listings = [
      {
        user_id: userIds[0],
        category_slug: 'alquileres',
        zone_slug: 'centro',
        title: 'Departamento 2 ambientes en Centro',
        description: 'Hermoso departamento de 2 ambientes completamente amueblado, excelente ubicación en el centro de la ciudad.',
        price: 85000,
        condition: 'nuevo',
        featured: true,
      },
      {
        user_id: userIds[1],
        category_slug: 'tecnologia',
        zone_slug: 'barrio-sur',
        title: 'iPhone 13 Pro Max 256GB',
        description: 'iPhone 13 Pro Max en excelente estado, con caja y cargador original.',
        price: 450000,
        condition: 'usado',
        featured: true,
      },
    ]

    for (const listing of listings) {
      await client.query(
        `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, condition, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          listing.user_id,
          categoriesMap.get(listing.category_slug),
          zonesMap.get(listing.zone_slug),
          listing.title,
          listing.description,
          listing.price,
          listing.condition,
          listing.featured,
        ]
      )
    }
    console.log('✅ Publicaciones insertadas')

    // Insertar restaurantes de ejemplo
    const restaurants = [
      {
        user_id: userIds[2],
        zone_slug: 'centro',
        name: 'Pizzería El Buen Sabor',
        description: 'Las mejores pizzas de Santa Fe, hechas con ingredientes frescos.',
        food_type: 'Pizza',
        phone: '3425345678',
        whatsapp: '3425345678',
        delivery: true,
        pickup: true,
      },
      {
        user_id: userIds[3],
        zone_slug: 'barrio-norte',
        name: 'Restaurante La Esquina',
        description: 'Comida casera y platos del día. Ambiente familiar.',
        food_type: 'Comida Casera',
        phone: '3425456789',
        whatsapp: '3425456789',
        delivery: true,
        pickup: true,
      },
    ]

    const restaurantIds: number[] = []
    for (const restaurant of restaurants) {
      const result = await client.query(
        `INSERT INTO restaurants (user_id, zone_id, name, description, food_type, phone, whatsapp, delivery, pickup)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          restaurant.user_id,
          zonesMap.get(restaurant.zone_slug),
          restaurant.name,
          restaurant.description,
          restaurant.food_type,
          restaurant.phone,
          restaurant.whatsapp,
          restaurant.delivery,
          restaurant.pickup,
        ]
      )
      restaurantIds.push(result.rows[0].id)
    }
    console.log('✅ Restaurantes insertados')

    // Insertar horarios de ejemplo (Lunes a Viernes, 12:00 - 15:00 y 19:00 - 23:00)
    for (const restaurantId of restaurantIds) {
      for (let day = 0; day < 5; day++) {
        // Almuerzo
        await client.query(
          `INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
           VALUES ($1, $2, $3, $4)`,
          [restaurantId, day, '12:00', '15:00']
        )
        // Cena
        await client.query(
          `INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time)
           VALUES ($1, $2, $3, $4)`,
          [restaurantId, day, '19:00', '23:00']
        )
      }
    }
    console.log('✅ Horarios insertados')

    // Insertar platos de ejemplo
    const menuItems = [
      {
        restaurant_id: restaurantIds[0],
        name: 'Pizza Muzzarella',
        description: 'Pizza clásica con muzzarella y salsa de tomate',
        price: 3500,
      },
      {
        restaurant_id: restaurantIds[0],
        name: 'Pizza Napolitana',
        description: 'Pizza con muzzarella, tomate y albahaca',
        price: 4200,
      },
      {
        restaurant_id: restaurantIds[1],
        name: 'Milanesa con papas',
        description: 'Milanesa de carne con papas fritas',
        price: 4500,
      },
      {
        restaurant_id: restaurantIds[1],
        name: 'Ensalada César',
        description: 'Ensalada fresca con pollo, crutones y aderezo césar',
        price: 3800,
      },
    ]

    for (const item of menuItems) {
      await client.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price)
         VALUES ($1, $2, $3, $4)`,
        [item.restaurant_id, item.name, item.description, item.price]
      )
    }
    console.log('✅ Platos insertados')

    console.log('🎉 Base de datos poblada correctamente!')
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos el seed
seedDatabase()
  .then(() => {
    console.log('✅ Seed completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el seed:', error)
    process.exit(1)
  })

