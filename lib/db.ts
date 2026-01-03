// Configuración de conexión a PostgreSQL (Neon)
// TypeScript: definimos tipos para la conexión
// En JavaScript esto sería: const { Pool } = require('pg')

import { Pool } from 'pg'

// Función para obtener la connection string
// TypeScript: función que retorna string
// En JavaScript sería: function getConnectionString() { ... }
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL || ''

  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno. Asegúrate de tener un archivo .env.local con DATABASE_URL')
  }

  return connectionString
}

// Creamos el pool de conexiones de forma lazy
// TypeScript: Pool es un tipo de pg
// En JavaScript sería: let pool = null; function getPool() { ... }
let poolInstance: Pool | null = null

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: getConnectionString(),
      ssl: {
        rejectUnauthorized: false, // Necesario para Neon
      },
      max: 20, // Máximo de conexiones en el pool
      idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30 segundos
      connectionTimeoutMillis: 30000, // Timeout de conexión de 30 segundos (Neon puede tardar más cuando está inactivo)
      allowExitOnIdle: false, // No permitir que el proceso termine cuando el pool esté idle
    })
    
    // Manejar errores del pool - importante para Neon
    poolInstance.on('error', (err) => {
      console.error('Error inesperado en el pool de conexiones:', err)
      // No destruir el pool aquí - pg manejará la reconexión automáticamente
    })
  }
  return poolInstance
}

// Exportamos el pool como getter para inicialización lazy
export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    return getPool()[prop as keyof Pool]
  }
})

// Helper para ejecutar queries
// TypeScript: definimos tipos genéricos para el resultado
// En JavaScript sería: export async function query(text, params) { ... }
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows
}

// Helper para ejecutar una query y obtener un solo resultado
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await pool.query(text, params)
  return result.rows[0] || null
}

