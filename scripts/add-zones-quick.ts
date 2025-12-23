// Script rápido para agregar solo las zonas faltantes
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { pool } from '../lib/db'

async function addZones() {
  const client = await pool.connect()

  try {
    console.log('🌱 Agregando zonas faltantes...')

    // Zonas que faltan
    const zones = [
      { name: 'Colastiné', slug: 'colastine' },
      { name: 'Colastiné, Santa Fe', slug: 'colastine-santa-fe' },
      { name: 'Santa Fe', slug: 'santa-fe' },
      { name: 'Toda la ciudad', slug: 'toda-la-ciudad' },
    ]

    for (const zone of zones) {
      try {
        const result = await client.query(
          `INSERT INTO zones (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING id, name`,
          [zone.name, zone.slug]
        )
        if (result.rows.length > 0) {
          console.log(`✅ Zona "${zone.name}" agregada (ID: ${result.rows[0].id})`)
        } else {
          console.log(`ℹ️  Zona "${zone.name}" ya existe`)
        }
      } catch (error: any) {
        if (error.code === '23505') { // Unique violation
          console.log(`ℹ️  Zona "${zone.name}" ya existe`)
        } else {
          console.error(`❌ Error agregando zona "${zone.name}":`, error.message)
        }
      }
    }

    console.log('\n✅ Proceso completado')
    
    // Mostrar todas las zonas disponibles
    const allZones = await client.query('SELECT id, name, slug FROM zones ORDER BY name')
    console.log(`\n📋 Total de zonas en la base de datos: ${allZones.rows.length}`)
    allZones.rows.forEach((zone: any) => {
      console.log(`   - ${zone.name} (${zone.slug})`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addZones()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })


