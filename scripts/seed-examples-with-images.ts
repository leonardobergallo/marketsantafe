// Script para crear ejemplos en la base de datos con imágenes
// Ejecutar: npm run db:seed-examples

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

// URLs de imágenes de ejemplo (usando placeholder images)
const exampleImages = {
  departamento: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  ],
  iphone: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
  ],
  auto: [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  ],
  sofa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
  ],
  restaurante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
  ],
}

async function seedExamples() {
  const client = await pool.connect()

  try {
    console.log('🌱 Creando ejemplos con imágenes...')

    // Obtener IDs de zonas y categorías
    const zonesResult = await client.query('SELECT id, slug FROM zones')
    const zonesMap = new Map(zonesResult.rows.map((z: any) => [z.slug, z.id]))

    const categoriesResult = await client.query('SELECT id, slug FROM categories')
    const categoriesMap = new Map(categoriesResult.rows.map((c: any) => [c.slug, c.id]))

    // Obtener o crear usuarios de ejemplo
    let userIds: number[] = []
    const usersResult = await client.query('SELECT id FROM users LIMIT 4')
    userIds = usersResult.rows.map((u: any) => u.id)

    if (userIds.length < 4) {
      const newUsers = [
        { name: 'María García', email: 'maria@example.com', phone: '3425123456' },
        { name: 'Carlos López', email: 'carlos@example.com', phone: '3425234567' },
        { name: 'Ana Martínez', email: 'ana@example.com', phone: '3425345678' },
        { name: 'Luis Fernández', email: 'luis@example.com', phone: '3425456789' },
      ]

      for (const user of newUsers.slice(userIds.length)) {
        const result = await client.query(
          `INSERT INTO users (name, email, phone, whatsapp) 
           VALUES ($1, $2, $3, $3) 
           RETURNING id`,
          [user.name, user.email, user.phone]
        )
        userIds.push(result.rows[0].id)
      }
    }

    // Eliminar publicaciones de ejemplo anteriores (opcional)
    await client.query("DELETE FROM listings WHERE title LIKE '%ejemplo%' OR title LIKE '%Ejemplo%'")

    // Crear publicaciones de ejemplo con imágenes
    const examples = [
      {
        user_id: userIds[0],
        category_slug: 'alquileres',
        zone_slug: 'centro',
        title: 'Departamento 2 ambientes en Centro - Ejemplo',
        description: 'Hermoso departamento de 2 ambientes completamente amueblado, excelente ubicación en el centro de la ciudad. Incluye servicios, balcón y cochera.',
        price: 85000,
        condition: 'nuevo',
        images: exampleImages.departamento,
        whatsapp: '3425123456',
        phone: '3425123456',
        featured: true,
      },
      {
        user_id: userIds[1],
        category_slug: 'tecnologia',
        zone_slug: 'barrio-sur',
        title: 'iPhone 13 Pro Max 256GB - Ejemplo',
        description: 'iPhone 13 Pro Max en excelente estado, con caja y cargador original. Pantalla perfecta, batería al 92%. Incluye funda y protector de pantalla.',
        price: 450000,
        condition: 'usado',
        images: exampleImages.iphone,
        whatsapp: '3425234567',
        featured: true,
      },
      {
        user_id: userIds[2],
        category_slug: 'vehiculos',
        zone_slug: 'barrio-norte',
        title: 'Ford Fiesta 2018 Kinetic - Ejemplo',
        description: 'Ford Fiesta 2018 en muy buen estado, 45000 km, service al día, único dueño. Papeles en regla, sin choques. Excelente para ciudad.',
        price: 3200000,
        condition: 'usado',
        images: exampleImages.auto,
        whatsapp: '3425345678',
        phone: '3425345678',
        featured: true,
      },
      {
        user_id: userIds[3],
        category_slug: 'hogar',
        zone_slug: 'san-martin',
        title: 'Sofá 3 cuerpos moderno - Ejemplo',
        description: 'Sofá de 3 cuerpos en excelente estado, color gris, muy cómodo. Perfecto para sala de estar. Se retira por zona San Martín.',
        price: 180000,
        condition: 'usado',
        images: exampleImages.sofa,
        whatsapp: '3425456789',
        featured: false,
      },
    ]

    for (const example of examples) {
      await client.query(
        `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, condition, images, featured, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          example.user_id,
          categoriesMap.get(example.category_slug),
          zonesMap.get(example.zone_slug),
          example.title,
          example.description,
          example.price,
          example.condition,
          JSON.stringify(example.images),
          example.featured,
          example.images[0], // Primera imagen como image_url para compatibilidad
        ]
      )
    }

    console.log('✅ Ejemplos con imágenes creados')

    // Crear restaurante de ejemplo con imágenes
    const restaurantExample = {
      user_id: userIds[0],
      zone_slug: 'centro',
      name: 'Pizzería El Buen Sabor - Ejemplo',
      description: 'Las mejores pizzas de Santa Fe, hechas con ingredientes frescos. Ambiente familiar y atención de primera.',
      food_type: 'Pizza',
      images: exampleImages.restaurante,
      phone: '3425123456',
      whatsapp: '3425123456',
      delivery: true,
      pickup: true,
    }

    await client.query(
      `INSERT INTO restaurants (user_id, zone_id, name, description, food_type, images, phone, whatsapp, delivery, pickup, image_url, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        restaurantExample.user_id,
        zonesMap.get(restaurantExample.zone_slug),
        restaurantExample.name,
        restaurantExample.description,
        restaurantExample.food_type,
        JSON.stringify(restaurantExample.images),
        restaurantExample.phone,
        restaurantExample.whatsapp,
        restaurantExample.delivery,
        restaurantExample.pickup,
        restaurantExample.images[0],
        true,
      ]
    )

    console.log('✅ Restaurante de ejemplo creado')
    console.log('🎉 Ejemplos creados exitosamente!')
  } catch (error) {
    console.error('❌ Error creando ejemplos:', error)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutamos el seed
seedExamples()
  .then(() => {
    console.log('✅ Seed completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el seed:', error)
    process.exit(1)
  })

