# 💳 Planes y Sistema de Pagos - MarketSantaFe

## 📋 Planes Actualizados

### Para Usuarios Individuales

#### 1. Plan Gratis - $0/mes
- ✅ Hasta 5 publicaciones activas
- ✅ Publicar productos y servicios
- ✅ Publicar propiedades (gratis)
- ✅ Contacto directo con compradores
- ❌ Sin destacados

#### 2. Plan Individual Premium - $4.999/mes
- ✅ Publicaciones ilimitadas
- ✅ Destacado en búsquedas
- ✅ Estadísticas de visitas
- ✅ Soporte prioritario
- ✅ Renovación automática de publicaciones

#### 3. Plan Propiedades Premium - $9.999/mes
- ✅ Hasta 10 propiedades activas
- ✅ Destacado en búsquedas
- ✅ Estadísticas detalladas
- ✅ Soporte prioritario
- ❌ Sin servicio profesional incluido

### Para Negocios

#### 1. Plan Negocio Básico - $9.999/mes
- ✅ Tienda online personalizada
- ✅ Hasta 50 productos
- ✅ Panel de control básico
- ✅ Estadísticas básicas
- ✅ Soporte por email

#### 2. Plan Negocio Pro - $19.999/mes
- ✅ Todo del plan Básico
- ✅ Productos ilimitados
- ✅ Estadísticas avanzadas
- ✅ Destacado en búsquedas
- ✅ Soporte prioritario
- ✅ Gestión de inventario

### Servicio Profesional Inmobiliario
- 💰 Precio: **Consultar** (personalizado según propiedad)
- ✅ Tasación profesional
- ✅ Fotos profesionales y 360°
- ✅ Publicación multiplataforma
- ✅ Coordinación de visitas
- ✅ Asesoramiento legal
- ✅ Soporte continuo

## 🔧 Sugerencias de Implementación

### 1. Base de Datos

#### Tabla `subscriptions` (Suscripciones)
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'individual-premium', 'properties-premium', 'business-basic', 'business-pro')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `payments` (Pagos)
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'transfer', 'mercadopago', 'whatsapp')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider_id VARCHAR(255), -- ID de MercadoPago, etc.
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Agregar campos a `users`
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
```

### 2. Integración de Pagos

#### Opción A: Mercado Pago (Recomendado para Argentina)
```bash
npm install mercadopago
```

**Ventajas:**
- ✅ Muy popular en Argentina
- ✅ Acepta tarjetas, transferencias, efectivo
- ✅ API fácil de integrar
- ✅ Webhooks para confirmar pagos

**Implementación:**
1. Crear cuenta en MercadoPago
2. Obtener Access Token
3. Crear preferencia de pago
4. Redirigir al usuario a MercadoPago
5. Recibir webhook de confirmación

#### Opción B: Stripe
```bash
npm install stripe
```

**Ventajas:**
- ✅ Internacional
- ✅ Muy seguro
- ✅ Excelente documentación
- ⚠️ Menos común en Argentina

#### Opción C: Manual (WhatsApp/Transferencia)
- Usuario solicita plan
- Se genera factura
- Usuario paga por transferencia/WhatsApp
- Admin activa plan manualmente

### 3. Flujo de Registro por Perfil

#### Usuario Individual
1. Selecciona "Usuario Individual"
2. Completa datos personales
3. Se crea cuenta con plan "free"
4. Puede publicar hasta 5 productos
5. Puede actualizar a "Individual Premium" desde su perfil

#### Negocio
1. Selecciona "Negocio"
2. Completa datos personales + nombre del negocio
3. Se crea cuenta con plan "free"
4. Puede crear tienda (hasta 10 productos en plan free)
5. Puede actualizar a "Negocio Básico" o "Negocio Pro" desde su perfil

### 4. API Routes Necesarias

#### `/api/subscriptions/create`
- Crear suscripción
- Generar link de pago
- Retornar URL de pago

#### `/api/subscriptions/webhook` (MercadoPago)
- Recibir notificación de pago
- Actualizar estado de suscripción
- Activar plan del usuario

#### `/api/subscriptions/current`
- Obtener suscripción actual del usuario
- Verificar si está activa
- Ver fecha de expiración

#### `/api/subscriptions/cancel`
- Cancelar suscripción
- Mantener acceso hasta fin de período

### 5. Middleware de Verificación

```typescript
// lib/subscription-check.ts
export async function checkSubscription(userId: number, requiredPlan: string) {
  const subscription = await getCurrentSubscription(userId)
  
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, reason: 'no_subscription' }
  }
  
  if (subscription.plan_type !== requiredPlan && subscription.plan_type !== 'free') {
    return { allowed: false, reason: 'wrong_plan' }
  }
  
  return { allowed: true, subscription }
}
```

### 6. Límites por Plan

```typescript
const PLAN_LIMITS = {
  free: {
    listings: 5,
    properties: 3,
    store_products: 10,
  },
  'individual-premium': {
    listings: -1, // ilimitado
    properties: 5,
    store_products: 0,
  },
  'properties-premium': {
    listings: 5,
    properties: 10,
    store_products: 0,
  },
  'business-basic': {
    listings: -1,
    properties: 0,
    store_products: 50,
  },
  'business-pro': {
    listings: -1,
    properties: -1,
    store_products: -1,
  },
}
```

## 🚀 Pasos para Implementar

### Fase 1: Base de Datos
1. ✅ Crear tablas `subscriptions` y `payments`
2. ✅ Agregar campos a `users`
3. ✅ Crear índices

### Fase 2: Registro Mejorado
1. ✅ Mejorar UI de selección de perfil (YA HECHO)
2. ✅ Asignar plan "free" por defecto
3. ✅ Guardar tipo de cuenta

### Fase 3: Integración de Pagos
1. Configurar MercadoPago
2. Crear API routes de pago
3. Implementar webhooks
4. Probar flujo completo

### Fase 4: Límites y Verificaciones
1. Implementar middleware de verificación
2. Agregar checks antes de publicar
3. Mostrar límites en UI
4. Sugerir upgrade cuando se alcance límite

### Fase 5: Panel de Suscripciones
1. Página para ver suscripción actual
2. Botón para actualizar plan
3. Historial de pagos
4. Cancelar suscripción

## 📱 Formas de Pago Soportadas

1. **Tarjeta de Crédito/Débito** - Via MercadoPago
2. **Transferencia Bancaria** - Manual o automática
3. **Mercado Pago** - Link de pago
4. **WhatsApp** - Coordinación manual

## 💡 Recomendaciones

1. **Empezar con MercadoPago** - Es el más usado en Argentina
2. **Plan Gratis Generoso** - 5 publicaciones gratis atrae usuarios
3. **Upgrade Fácil** - Botón visible cuando se alcanza límite
4. **Prueba Gratis** - 7 días gratis en planes premium
5. **Descuentos Anuales** - 20% descuento si paga anual

## 🔐 Seguridad

- ✅ Nunca guardar datos de tarjeta
- ✅ Usar webhooks para confirmar pagos
- ✅ Verificar firma de webhooks
- ✅ Logs de todos los pagos
- ✅ Manejo de errores robusto





