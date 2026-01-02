// Script para agregar índices de performance a properties
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function addPropertiesIndexes() {
  const client = await pool.connect()
  try {
    console.log('🔧 Agregando índices de performance a properties...')

    // Índice en created_at (usado para ORDER BY)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
    `)
    console.log('✅ Índice creado en created_at')

    // Índice compuesto para active + created_at (útil para queries comunes)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_active_created_at 
      ON properties(active, created_at DESC);
    `)
    console.log('✅ Índice compuesto creado en (active, created_at)')

    // Índice para búsqueda de texto (GIN index para búsqueda full-text más rápida)
    // Nota: Esto requiere la extensión pg_trgm para búsquedas ILIKE más rápidas
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
      console.log('✅ Extensión pg_trgm creada/verificada')
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_properties_title_gin 
        ON properties USING gin(title gin_trgm_ops);
      `)
      console.log('✅ Índice GIN creado en title para búsquedas rápidas')
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_properties_description_gin 
        ON properties USING gin(description gin_trgm_ops);
      `)
      console.log('✅ Índice GIN creado en description para búsquedas rápidas')
    } catch (error: any) {
      if (error.code === '42704') {
        console.log('⚠️  Extensión pg_trgm no disponible, omitiendo índices GIN')
      } else {
        throw error
      }
    }

    console.log('✅ Todos los índices agregados exitosamente')
  } catch (error) {
    console.error('❌ Error al agregar índices:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addPropertiesIndexes()
  .then(() => {
    console.log('Script completado.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error en el script:', error)
    process.exit(1)
  })

