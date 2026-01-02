// Script para crear propiedades de ejemplo para Solar Propiedades
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function createSolarProperties() {
  const client = await pool.connect()
  try {
    console.log('🚀 Creando propiedades de ejemplo para Solar Propiedades...')

    // Obtener el usuario de Solar Propiedades
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = 'solar@propiedades.com'"
    )

    if (userResult.rows.length === 0) {
      console.error('❌ No se encontró el usuario de Solar Propiedades')
      console.log('   Ejecuta primero: npm run db:create-solar-user')
      return
    }

    const solarUserId = userResult.rows[0].id
    console.log(`✅ Usuario encontrado (ID: ${solarUserId})`)

    // Obtener una zona (usar la primera disponible)
    const zoneResult = await client.query('SELECT id FROM zones LIMIT 1')
    const zoneId = zoneResult.rows.length > 0 ? zoneResult.rows[0].id : null

    // Propiedades de ejemplo para Solar Propiedades
    const properties = [
      {
        title: 'Casa moderna 3 dormitorios – Barrio Sur',
        description: 'Hermosa casa moderna con 3 dormitorios, 2 baños, cocina integrada, living amplio y patio. Excelente ubicación en Barrio Sur, cerca de servicios y transporte. Ideal para familia.',
        type: 'venta',
        price: 180000,
        currency: 'ARS',
        rooms: 3,
        bathrooms: 2,
        area_m2: 120,
        address: 'Av. San Martín 2500, Santa Fe',
        phone: '3425123456',
        whatsapp: '5493425123456',
        email: 'info@solarpropiedades.com',
        professional_service: false,
      },
      {
        title: 'Departamento 1 dormitorio – Centro',
        description: 'Departamento luminoso de 1 dormitorio en pleno centro. Incluye cocina, baño completo, living comedor y balcón. Excelente para profesionales o estudiantes. Incluye expensas.',
        type: 'alquiler',
        price: 55000,
        currency: 'ARS',
        rooms: 1,
        bathrooms: 1,
        area_m2: 45,
        address: 'San Martín 1500, Santa Fe',
        phone: '3425123456',
        whatsapp: '5493425123456',
        email: 'info@solarpropiedades.com',
        professional_service: false,
      },
      {
        title: 'Monoambiente amoblado – Recoleta Santa Fe',
        description: 'Monoambiente completamente amoblado en zona Recoleta. Incluye cama, cocina equipada, baño y espacio de trabajo. Ideal para estudiantes o profesionales jóvenes. Listo para entrar.',
        type: 'alquiler',
        price: 45000,
        currency: 'ARS',
        rooms: 1,
        bathrooms: 1,
        area_m2: 35,
        address: 'Av. de los Trabajadores 2000, Santa Fe',
        phone: '3425123456',
        whatsapp: '5493425123456',
        email: 'info@solarpropiedades.com',
        professional_service: false,
      },
      {
        title: 'Casa con patio grande – Barrio Candioti',
        description: 'Casa amplia con 2 dormitorios, 1 baño, cocina, living y patio grande. Perfecta para familias que buscan espacio. Ubicada en tranquilo barrio residencial. Excelente oportunidad.',
        type: 'venta',
        price: 140000,
        currency: 'ARS',
        rooms: 2,
        bathrooms: 1,
        area_m2: 90,
        address: 'Barrio Candioti, Santa Fe',
        phone: '3425123456',
        whatsapp: '5493425123456',
        email: 'info@solarpropiedades.com',
        professional_service: false,
      },
      {
        title: 'Local comercial – Centro',
        description: 'Local comercial en excelente ubicación del centro. Ideal para comercio, oficina o emprendimiento. Superficie de 60m², baño, buena iluminación natural. Gran oportunidad de inversión.',
        type: 'alquiler',
        price: 80000,
        currency: 'ARS',
        rooms: null,
        bathrooms: 1,
        area_m2: 60,
        address: 'San Martín 1800, Santa Fe',
        phone: '3425123456',
        whatsapp: '5493425123456',
        email: 'info@solarpropiedades.com',
        professional_service: false,
      },
    ]

    console.log(`\n📝 Insertando ${properties.length} propiedades...`)

    let created = 0
    let skipped = 0

    for (const prop of properties) {
      // Verificar si ya existe una propiedad similar
      const existing = await client.query(
        'SELECT id FROM properties WHERE title = $1 AND user_id = $2',
        [prop.title, solarUserId]
      )

      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Ya existe: ${prop.title}`)
        skipped++
        continue
      }

      // Insertar propiedad
      await client.query(
        `INSERT INTO properties (
          user_id, zone_id, type, title, description, price, currency,
          rooms, bathrooms, area_m2, address,
          phone, whatsapp, email, professional_service, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          solarUserId,
          zoneId,
          prop.type,
          prop.title,
          prop.description,
          prop.price,
          prop.currency,
          prop.rooms,
          prop.bathrooms,
          prop.area_m2,
          prop.address,
          prop.phone,
          prop.whatsapp,
          prop.email,
          prop.professional_service,
          true, // active
        ]
      )

      console.log(`   ✅ Creada: ${prop.title}`)
      created++
    }

    console.log('\n✅ Proceso completado!')
    console.log(`   Creadas: ${created}`)
    console.log(`   Omitidas: ${skipped}`)
    console.log('\n🔗 Ver propiedades en:')
    console.log('   http://localhost:3000/propiedades')
    console.log('   http://localhost:3000/inmobiliaria-en-equipo')

  } catch (error) {
    console.error('❌ Error creando propiedades:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

createSolarProperties()



