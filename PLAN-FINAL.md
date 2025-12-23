# 📋 Plan para Terminar MarketSantaFe

## ✅ Lo que ya está hecho

### Estructura Base
- ✅ Next.js 16 con App Router + TypeScript + Tailwind
- ✅ Base de datos PostgreSQL (Neon) configurada
- ✅ Tablas creadas (zones, categories, users, listings, restaurants, etc.)
- ✅ Datos iniciales poblados (zonas, categorías, usuarios, restaurantes)

### Páginas y Componentes
- ✅ Home como HUB con selector de zona y dos CTAs
- ✅ Página /mercado con filtros y búsqueda
- ✅ Página /comer para gastronomía con mapa
- ✅ Página /publicar con selector de vertical
- ✅ Página /aviso/[id] para detalles
- ✅ Componentes: Header, Footer, Cards, Filters, ZoneSelector
- ✅ Mapa de Google Maps (componente creado)

### UX/UI
- ✅ Diseño minimalista y moderno
- ✅ Zona destacada en cards
- ✅ Responsive (mobile-first)
- ✅ Copy humano y local

---

## 🎯 Plan de Implementación (Priorizado)

### FASE 1: APIs y Conexión con Base de Datos (2-3 días)

#### 1.1 Crear API Routes
```
app/api/
  ├── listings/
  │   ├── route.ts          # GET /api/listings (listar con filtros)
  │   └── [id]/route.ts     # GET /api/listings/[id] (detalle)
  ├── restaurants/
  │   ├── route.ts          # GET /api/restaurants (listar)
  │   └── [id]/route.ts     # GET /api/restaurants/[id]
  ├── zones/route.ts        # GET /api/zones
  ├── categories/route.ts   # GET /api/categories
  └── publish/
      ├── listing/route.ts  # POST /api/publish/listing
      └── restaurant/route.ts # POST /api/publish/restaurant
```

**Tareas:**
- [ ] Crear helper `lib/db-queries.ts` con funciones reutilizables
- [ ] Implementar GET /api/listings con filtros (zona, categoría, precio, etc.)
- [ ] Implementar GET /api/listings/[id] para detalle
- [ ] Implementar GET /api/restaurants con filtros
- [ ] Implementar GET /api/zones y /api/categories
- [ ] Implementar POST /api/publish/listing
- [ ] Implementar POST /api/publish/restaurant

#### 1.2 Reemplazar Mocks por APIs
- [ ] Actualizar `/mercado` para usar `/api/listings`
- [ ] Actualizar `/comer` para usar `/api/restaurants`
- [ ] Actualizar `/aviso/[id]` para usar `/api/listings/[id]`
- [ ] Actualizar Home para usar APIs
- [ ] Actualizar `/publicar` para enviar a APIs

---

### FASE 2: Funcionalidades Clave (2-3 días)

#### 2.1 Google Maps
- [ ] Obtener API Key de Google Maps
- [ ] Agregar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` a `.env.local`
- [ ] Probar y ajustar el componente `RestaurantMap`
- [ ] Agregar mapa también en detalle de restaurante

#### 2.2 Subida de Fotos
**Opción A: Cloudinary (Recomendado - fácil y gratuito)**
- [ ] Crear cuenta en Cloudinary
- [ ] Instalar `cloudinary` y `next-cloudinary`
- [ ] Crear componente `ImageUpload`
- [ ] Integrar en formularios de publicar

**Opción B: Supabase Storage**
- [ ] Configurar Supabase Storage
- [ ] Crear bucket para imágenes
- [ ] Implementar subida

#### 2.3 Indicadores de Actividad
- [ ] Agregar campo `last_active` a tabla `users`
- [ ] Crear función para calcular "Activo hoy" / "Responde rápido"
- [ ] Mostrar en `ListingCard` y cards de restaurantes
- [ ] Actualizar `last_active` cuando usuario publica

---

### FASE 3: Humanizar y Mejorar UX (1-2 días)

#### 3.1 Mostrar Persona/Negocio
- [ ] Agregar avatares a usuarios (campo `avatar_url`)
- [ ] Mostrar nombre de usuario/negocio en cards
- [ ] Agregar badge "Negocio" vs "Particular"
- [ ] Mostrar en página de detalle

#### 3.2 Mejorar Copy
- [ ] Revisar todos los textos y hacerlos más humanos
- [ ] Agregar mensajes de bienvenida
- [ ] Mejorar mensajes de error
- [ ] Agregar tooltips y ayuda contextual

#### 3.3 Validaciones y Errores
- [ ] Agregar validación de formularios con Zod
- [ ] Mostrar mensajes de error claros
- [ ] Manejar errores de API gracefully
- [ ] Agregar loading states

---

### FASE 4: Optimización y Pulido (1-2 días)

#### 4.1 Performance
- [ ] Optimizar imágenes (usar next/image correctamente)
- [ ] Agregar paginación en listados
- [ ] Implementar lazy loading
- [ ] Optimizar queries de base de datos (índices)

#### 4.2 SEO y Meta Tags
- [ ] Agregar metadata dinámica a cada página
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] robots.txt

#### 4.3 Testing Básico
- [ ] Probar todas las rutas
- [ ] Probar formularios
- [ ] Probar filtros y búsqueda
- [ ] Probar en diferentes dispositivos

---

### FASE 5: Deploy y Producción (1 día)

#### 5.1 Preparar para Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Agregar `DATABASE_URL` a Vercel
- [ ] Agregar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` a Vercel
- [ ] Configurar dominio (opcional)

#### 5.2 Deploy
- [ ] Conectar repositorio GitHub con Vercel
- [ ] Hacer deploy inicial
- [ ] Verificar que todo funcione en producción
- [ ] Configurar analytics (opcional)

---

## 📝 Checklist Rápido

### Crítico (Debe estar)
- [ ] APIs funcionando
- [ ] Conexión con PostgreSQL
- [ ] Formularios de publicar funcionando
- [ ] Búsqueda y filtros funcionando
- [ ] Mapa de Google Maps funcionando
- [ ] Subida de fotos funcionando

### Importante (Debería estar)
- [ ] Indicadores de actividad
- [ ] Mostrar persona/negocio
- [ ] Validaciones de formularios
- [ ] Manejo de errores
- [ ] SEO básico

### Opcional (Nice to have)
- [ ] Autenticación de usuarios
- [ ] Sistema de favoritos
- [ ] Notificaciones
- [ ] Analytics avanzado

---

## 🚀 Orden de Ejecución Recomendado

1. **Día 1-2**: Crear todas las APIs y conectar con PostgreSQL
2. **Día 3**: Reemplazar mocks por APIs en todas las páginas
3. **Día 4**: Configurar Google Maps y subida de fotos
4. **Día 5**: Agregar indicadores de actividad y humanizar
5. **Día 6**: Optimización, validaciones y testing
6. **Día 7**: Deploy y ajustes finales

---

## 📚 Recursos Necesarios

### APIs Externas
- [ ] Google Maps API Key (gratis hasta $200/mes)
- [ ] Cloudinary cuenta (gratis hasta 25GB)
- [ ] O Supabase Storage (si usas Supabase)

### Documentación
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL con Node.js](https://node-postgres.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Cloudinary Next.js](https://cloudinary.com/documentation/nextjs_integration)

---

## 🎯 Meta Final

**Una plataforma local, clara y humana, que se sienta como el punto de encuentro digital de Santa Fe.**

- ✅ Zona primero
- ✅ Contacto directo
- ✅ Publicar rápido
- ✅ Mobile-first
- ✅ Minimalista y moderna




