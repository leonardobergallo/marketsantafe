import { writeFileSync } from 'fs'
import { resolve } from 'path'

const envLocalContent = `# ============================================
# VARIABLES DE ENTORNO - MarketSantaFe
# ============================================

# ============================================
# BASE DE DATOS (OBLIGATORIO)
# ============================================
# URL de conexión a PostgreSQL (Neon)
# Formato: postgresql://usuario:password@host:puerto/database?sslmode=require
# Ejemplo de Neon:
DATABASE_URL=postgresql://neondb_owner:npg_xVkM26JhjHFU@ep-odd-rice-ah6sjl8e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ============================================
# MEJORA DE IMÁGENES CON IA (OPCIONAL)
# ============================================
# Opción 1: Remove.bg (RECOMENDADO - 50 imágenes/mes gratis)
# 1. Ve a https://www.remove.bg/api
# 2. Crea una cuenta gratuita
# 3. Obtén tu API key desde el dashboard
# 4. Pega tu API key aquí (descomenta la línea de abajo):
# REMOVEBG_API_KEY=tu_api_key_aqui

# Opción 2: Clipdrop (Alternativa - 100 requests/mes gratis)
# 1. Ve a https://clipdrop.co/api
# 2. Crea una cuenta gratuita
# 3. Obtén tu API key desde el dashboard
# 4. Pega tu API key aquí (descomenta la línea de abajo):
# CLIPDROP_API_KEY=tu_api_key_aqui

# Nota: Solo necesitas configurar UNA de las dos opciones.
# El sistema usa Remove.bg primero, y si no está disponible, usa Clipdrop.

# ============================================
# GOOGLE MAPS (OPCIONAL)
# ============================================
# API Key de Google Maps para mostrar mapas en restaurantes
# 1. Ve a https://console.cloud.google.com/
# 2. Crea un proyecto o selecciona uno existente
# 3. Habilita la API de Maps JavaScript
# 4. Crea una API key
# 5. Pega tu API key aquí (descomenta la línea de abajo):
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# ============================================
# NOTAS IMPORTANTES
# ============================================
# - Este archivo NO debe subirse a Git (ya está en .gitignore)
# - Para producción en Vercel, agrega estas variables en:
#   Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
# - Reinicia el servidor de desarrollo después de cambiar estas variables:
#   Ctrl+C y luego npm run dev
`

const envLocalPath = resolve(process.cwd(), '.env.local')

try {
  writeFileSync(envLocalPath, envLocalContent, 'utf8')
  console.log('✅ Archivo .env.local creado exitosamente')
  console.log('📝 Ubicación:', envLocalPath)
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Abre el archivo .env.local')
  console.log('   2. Verifica que DATABASE_URL esté correcta')
  console.log('   3. (Opcional) Agrega REMOVEBG_API_KEY o CLIPDROP_API_KEY para mejorar imágenes')
  console.log('   4. Reinicia el servidor: npm run dev')
} catch (error) {
  console.error('❌ Error al crear .env.local:', error)
  process.exit(1)
}


