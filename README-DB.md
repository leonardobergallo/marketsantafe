# Configuración de Base de Datos

## Pasos para configurar PostgreSQL (Neon)

### 1. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
DATABASE_URL=postgresql://neondb_owner:npg_xVkM26JhjHFU@ep-odd-rice-ah6sjl8e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Crear las tablas

Ejecuta el script de setup para crear todas las tablas:

```bash
npm run db:setup
```

Este script crea:
- `zones` - Zonas/barrios de Santa Fe
- `categories` - Categorías del mercado
- `users` - Usuarios (personas y negocios)
- `listings` - Publicaciones del mercado
- `restaurants` - Restaurantes/locales gastronómicos
- `restaurant_hours` - Horarios de restaurantes
- `menu_items` - Platos/menús

### 3. Poblar con datos iniciales

Ejecuta el script de seed para insertar datos de ejemplo:

```bash
npm run db:seed
```

Este script inserta:
- 12 zonas de Santa Fe
- 11 categorías del mercado
- 4 usuarios de ejemplo
- 2 publicaciones de ejemplo
- 2 restaurantes de ejemplo
- Horarios y platos de ejemplo

## Estructura de la Base de Datos

### Tablas principales

**zones**: Zonas/barrios de Santa Fe
- id, name, slug, created_at

**categories**: Categorías del mercado
- id, name, slug, icon, created_at

**users**: Usuarios (personas y negocios)
- id, name, email, phone, whatsapp, is_business, business_name, avatar_url, created_at, updated_at

**listings**: Publicaciones del mercado
- id, user_id, category_id, zone_id, title, description, price, condition, image_url, featured, active, views, created_at, updated_at

**restaurants**: Restaurantes/locales gastronómicos
- id, user_id, zone_id, name, description, food_type, image_url, logo_url, address, phone, whatsapp, delivery, pickup, active, created_at, updated_at

**restaurant_hours**: Horarios de restaurantes
- id, restaurant_id, day_of_week, open_time, close_time, is_closed, created_at

**menu_items**: Platos/menús
- id, restaurant_id, name, description, price, image_url, available, created_at, updated_at

## Uso en el código

```typescript
import { query, queryOne } from '@/lib/db'

// Obtener todas las zonas
const zones = await query('SELECT * FROM zones ORDER BY name')

// Obtener una zona por slug
const zone = await queryOne('SELECT * FROM zones WHERE slug = $1', ['centro'])

// Insertar una publicación
await query(
  'INSERT INTO listings (user_id, category_id, zone_id, title, description, price) VALUES ($1, $2, $3, $4, $5, $6)',
  [userId, categoryId, zoneId, title, description, price]
)
```


