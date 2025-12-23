# 🔧 Configuración de Variables de Entorno

## 📋 Archivo `.env.local`

El archivo `.env.local` contiene todas las variables de entorno necesarias para que la aplicación funcione correctamente.

## 🚀 Configuración Rápida

### 1. Crear el archivo `.env.local`

El archivo ya está creado en la raíz del proyecto. Si no existe, créalo con este contenido:

```env
DATABASE_URL=tu_url_de_base_de_datos
```

### 2. Variables Obligatorias

#### `DATABASE_URL` (OBLIGATORIO)
URL de conexión a PostgreSQL (Neon).

**Cómo obtenerla:**
1. Ve a tu proyecto en [Neon Console](https://console.neon.tech/)
2. Selecciona tu base de datos
3. Ve a "Connection Details"
4. Copia la "Connection String"
5. Pégala en `.env.local`

**Formato:**
```
DATABASE_URL=postgresql://usuario:password@host:puerto/database?sslmode=require
```

### 3. Variables Opcionales

#### `REMOVEBG_API_KEY` (Opcional - Para mejorar imágenes)
API key de Remove.bg para mejorar imágenes con IA.

**Cómo obtenerla:**
1. Ve a [https://www.remove.bg/api](https://www.remove.bg/api)
2. Crea una cuenta gratuita
3. Ve al Dashboard
4. Copia tu API key
5. Pégala en `.env.local`

**Plan gratuito:** 50 imágenes/mes

#### `CLIPDROP_API_KEY` (Opcional - Alternativa para mejorar imágenes)
API key de Clipdrop como alternativa a Remove.bg.

**Cómo obtenerla:**
1. Ve a [https://clipdrop.co/api](https://clipdrop.co/api)
2. Crea una cuenta gratuita
3. Ve al Dashboard
4. Copia tu API key
5. Pégala en `.env.local`

**Plan gratuito:** 100 requests/mes

**Nota:** Solo necesitas configurar UNA de las dos opciones. El sistema usa Remove.bg primero, y si no está disponible, usa Clipdrop.

#### `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Opcional - Para mapas)
API key de Google Maps para mostrar mapas en la sección de restaurantes.

**Cómo obtenerla:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de "Maps JavaScript API"
4. Ve a "Credentials" → "Create Credentials" → "API Key"
5. Copia tu API key
6. Pégala en `.env.local`

## 🔄 Después de Configurar

1. **Reinicia el servidor de desarrollo:**
   ```bash
   # Presiona Ctrl+C para detener el servidor
   # Luego ejecuta:
   npm run dev
   ```

2. **Verifica que las variables se cargaron:**
   - Si hay errores de conexión a la base de datos, verifica que `DATABASE_URL` esté correcta
   - Si las mejoras de imágenes no funcionan, verifica que tengas configurada `REMOVEBG_API_KEY` o `CLIPDROP_API_KEY`

## 🌐 Configuración en Vercel (Producción)

Para desplegar en Vercel, necesitas agregar las variables de entorno en el dashboard:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable:
   - `DATABASE_URL` (obligatorio)
   - `REMOVEBG_API_KEY` (opcional)
   - `CLIPDROP_API_KEY` (opcional)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (opcional)
5. Selecciona los ambientes donde aplicará (Production, Preview, Development)
6. Haz clic en **Save**
7. **Redeploya** tu aplicación para que los cambios surtan efecto

## ⚠️ Seguridad

- **NUNCA** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
- **NUNCA** compartas tus API keys públicamente
- Si una API key se compromete, revócala inmediatamente y genera una nueva

## 📝 Ejemplo Completo

```env
# Base de datos (obligatorio)
DATABASE_URL=postgresql://usuario:password@host:puerto/database?sslmode=require

# Mejora de imágenes (opcional - solo una)
REMOVEBG_API_KEY=tu_api_key_removebg
# O
CLIPDROP_API_KEY=tu_api_key_clipdrop

# Google Maps (opcional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_google_maps
```

## ❓ Problemas Comunes

### Error: "DATABASE_URL no está definida"
- Verifica que el archivo `.env.local` exista en la raíz del proyecto
- Verifica que la variable `DATABASE_URL` esté escrita correctamente
- Reinicia el servidor de desarrollo

### Las mejoras de imágenes no funcionan
- Verifica que tengas configurada `REMOVEBG_API_KEY` o `CLIPDROP_API_KEY`
- Verifica que tu API key sea válida
- Verifica que no hayas excedido el límite mensual gratuito

### Los mapas no se muestran
- Verifica que tengas configurada `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Verifica que la API de Maps JavaScript esté habilitada en Google Cloud Console
- Verifica que tu API key tenga los permisos correctos


