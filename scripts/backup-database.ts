// Script para crear backup de la base de datos Neon
import { config } from 'dotenv'
import { resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

const execAsync = promisify(exec)

async function backupDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL no está definida en las variables de entorno')
      process.exit(1)
    }

    // Crear directorio de backups si no existe
    const backupsDir = 'backups'
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    // Generar nombre de archivo con fecha y hora
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const backupFile = `${backupsDir}/backup-${timestamp}.sql`

    console.log('📦 Creando backup de la base de datos Neon...\n')
    console.log(`📁 Archivo de backup: ${backupFile}\n`)

    // Parsear DATABASE_URL para obtener los parámetros
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || '5432'
    const database = url.pathname.slice(1) // Remover el '/' inicial
    const user = url.username
    const password = url.password

    // Construir comando pg_dump
    // Usar PGPASSWORD en variable de entorno para evitar que aparezca en el proceso
    const pgDumpCmd = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f "${backupFile}" --no-owner --no-acl`

    console.log('⏳ Ejecutando pg_dump...')

    try {
      // Ejecutar pg_dump con PGPASSWORD
      const env = { ...process.env, PGPASSWORD: password }
      await execAsync(pgDumpCmd, { env })

      // Verificar que el archivo se creó
      if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile)
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
        console.log(`\n✅ Backup creado exitosamente!`)
        console.log(`   📁 Archivo: ${backupFile}`)
        console.log(`   📊 Tamaño: ${fileSizeMB} MB`)
        console.log(`\n💡 Para restaurar este backup, usa:`)
        console.log(`   psql $DATABASE_URL < ${backupFile}`)
        console.log(`   o`)
        console.log(`   PGPASSWORD=tu_password psql -h ${host} -p ${port} -U ${user} -d ${database} < ${backupFile}`)
      } else {
        console.error('❌ El archivo de backup no se creó')
        process.exit(1)
      }
    } catch (error: any) {
      console.error('\n❌ Error ejecutando pg_dump:', error.message)
      console.error('\n💡 Asegúrate de tener pg_dump instalado:')
      console.error('   Windows: Descarga PostgreSQL desde https://www.postgresql.org/download/windows/')
      console.error('   Mac: brew install postgresql')
      console.error('   Linux: sudo apt-get install postgresql-client')
      process.exit(1)
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

backupDatabase()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


