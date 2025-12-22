// Script para agregar zonas y categorías faltantes a la base de datos
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { pool } from '../lib/db'

async function addMissingData() {
  const client = await pool.connect()

  try {
    console.log('🌱 Agregando zonas y categorías faltantes...')

    // Zonas adicionales que pueden venir del Excel
    const additionalZones = [
      { name: 'Colastiné', slug: 'colastine' },
      { name: 'Colastiné, Santa Fe', slug: 'colastine-santa-fe' },
      { name: 'Santa Fe', slug: 'santa-fe' },
    ]

    for (const zone of additionalZones) {
      await client.query(
        `INSERT INTO zones (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [zone.name, zone.slug]
      )
      console.log(`✅ Zona "${zone.name}" agregada o ya existe`)
    }

    // Categorías adicionales que pueden venir del Excel
    const additionalCategories = [
      { name: 'Jardín y Herramientas', slug: 'jardin-herramientas', icon: 'Wrench' },
      { name: 'Consolas y Videojuegos', slug: 'consolas-videojuegos', icon: 'Gamepad2' },
      { name: 'Hogar y Oficina', slug: 'hogar-oficina', icon: 'Briefcase' },
    ]

    for (const category of additionalCategories) {
      await client.query(
        `INSERT INTO categories (name, slug, icon) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [category.name, category.slug, category.icon]
      )
      console.log(`✅ Categoría "${category.name}" agregada o ya existe`)
    }

    console.log('✅ Zonas y categorías faltantes agregadas')
  } catch (error) {
    console.error('❌ Error agregando datos:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addMissingData()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

