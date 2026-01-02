// Script para agregar zonas faltantes
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addMissingZones() {
  const client = await pool.connect()

  try {
    console.log('📍 Agregando zonas faltantes...\n')

    const zonesToAdd = [
      { name: 'Sauce Viejo', slug: 'sauce-viejo' },
      { name: 'San José del Rincón', slug: 'san-jose-del-rincon' },
      { name: 'Monte Vera', slug: 'monte-vera' },
    ]

    for (const zone of zonesToAdd) {
      // Verificar si ya existe
      const existing = await client.query(
        'SELECT id, name FROM zones WHERE LOWER(name) = LOWER($1) OR slug = $2',
        [zone.name, zone.slug]
      )

      if (existing.rows.length > 0) {
        console.log(`✅ Zona ya existe: ${zone.name} (ID: ${existing.rows[0].id})`)
      } else {
        // Crear la zona
        const result = await client.query(
          'INSERT INTO zones (name, slug) VALUES ($1, $2) RETURNING id, name',
          [zone.name, zone.slug]
        )
        console.log(`✅ Zona creada: ${result.rows[0].name} (ID: ${result.rows[0].id})`)
      }
    }

    console.log('\n✅ Script completado')

  } catch (error) {
    console.error('❌ Error agregando zonas:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar script
addMissingZones()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

