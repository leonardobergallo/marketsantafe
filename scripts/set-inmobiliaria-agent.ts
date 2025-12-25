// Script para marcar usuarios como agentes de inmobiliaria
// Uso: npx tsx scripts/set-inmobiliaria-agent.ts <user_id> [true|false]
// Ejemplo: npx tsx scripts/set-inmobiliaria-agent.ts 1 true

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function setInmobiliariaAgent(userId: number, isAgent: boolean) {
  const client = await pool.connect()

  try {
    console.log(`🔄 ${isAgent ? 'Marcando' : 'Desmarcando'} usuario ${userId} como agente de inmobiliaria...`)

    // Verificar que el usuario existe
    const userCheck = await client.query(
      'SELECT id, name, email, is_inmobiliaria_agent FROM users WHERE id = $1',
      [userId]
    )

    if (userCheck.rows.length === 0) {
      console.error(`❌ Usuario con ID ${userId} no encontrado`)
      return
    }

    const user = userCheck.rows[0]
    console.log(`📋 Usuario encontrado: ${user.name} (${user.email})`)
    console.log(`   Estado actual: ${user.is_inmobiliaria_agent ? 'Agente' : 'No agente'}`)

    // Actualizar el campo
    await client.query(
      'UPDATE users SET is_inmobiliaria_agent = $1 WHERE id = $2',
      [isAgent, userId]
    )

    console.log(`✅ Usuario ${userId} ${isAgent ? 'marcado como' : 'desmarcado de'} agente de inmobiliaria`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    client.release()
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('❌ Uso: npx tsx scripts/set-inmobiliaria-agent.ts <user_id> [true|false]')
  console.error('   Ejemplo: npx tsx scripts/set-inmobiliaria-agent.ts 1 true')
  process.exit(1)
}

const userId = parseInt(args[0])
const isAgent = args.length > 1 ? args[1].toLowerCase() === 'true' : true

if (isNaN(userId)) {
  console.error('❌ El user_id debe ser un número')
  process.exit(1)
}

setInmobiliariaAgent(userId, isAgent)
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })

