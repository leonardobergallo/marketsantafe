# Estrategia de Período Gratuito - MarketSantaFe

## 📋 Resumen

Durante el lanzamiento inicial de la plataforma, ofrecemos un **período gratuito de 1 mes** para todos los nuevos usuarios. Esta estrategia tiene como objetivo:

1. **Acumular usuarios iniciales** sin barreras de entrada
2. **Generar contenido** (publicaciones) que atraiga más usuarios
3. **Crear hábito** de uso de la plataforma
4. **Convertir** usuarios gratuitos a planes pagos al finalizar el período

## 🎯 Configuración

### Plan Gratuito
- **Nombre**: Plan Gratuito - Lanzamiento
- **Duración**: 30 días (1 mes)
- **Precio**: $0 ARS
- **Características**: 
  - Publicaciones ilimitadas
  - Hasta 10 fotos por publicación
  - Acceso completo a todas las funcionalidades
  - Sin costo durante 1 mes

### Límites
- **Fecha límite del período promocional**: 30 de junio de 2025
- **Máximo de usuarios con plan gratis**: 1,000 usuarios
- **Asignación automática**: Se asigna al registrarse

## 🔄 Flujo de Usuario

### 1. Registro
- Usuario se registra en la plataforma
- Automáticamente se le asigna el plan gratuito (si hay cupos disponibles)
- Recibe acceso completo por 30 días

### 2. Durante el Período Gratuito
- Usuario puede publicar sin restricciones
- Ve un banner indicando días restantes
- Recibe notificaciones cuando quedan 7 días o menos (última semana)

### 3. Conversión
- Cuando quedan 7 días o menos, se muestra banner de advertencia
- Se ofrece descuento del 20% en el primer mes de plan pago
- Usuario puede elegir entre:
  - Plan Particular ($5,000/mes)
  - Plan Bar/Restaurante ($15,000/mes)
  - Plan Agente Inmobiliario ($25,000/mes)

### 4. Post-Período Gratuito
- Si no contrata un plan, pierde acceso a publicar
- Sus publicaciones existentes quedan ocultas
- Puede reactivar en cualquier momento contratando un plan

## 📊 Métricas a Seguir

### Conversión
- **Tasa de conversión objetivo**: 30-40% de usuarios gratuitos
- **Momento de conversión**: Últimos 7 días del período gratuito
- **Plan más popular**: Según tipo de usuario

### Retención
- Usuarios que publican al menos 3 veces durante el período gratuito
- Usuarios que vuelven después de contratar plan pago

## 🎨 Elementos Visuales

### Banner de Plan Gratuito
- **Verde**: Cuando hay más de 7 días restantes
- **Amarillo**: Cuando quedan 7 días o menos
- **Rojo**: Cuando el período ha finalizado

### Mensajes Clave
1. **Bienvenida**: "¡Estás en período gratuito! Disfrutá acceso completo sin costo"
2. **Advertencia**: "Tu período gratuito vence pronto. No te quedes sin publicar"
3. **Finalizado**: "Tu período gratuito ha finalizado. Elegí un plan para seguir"

## 🔧 Configuración Técnica

### Archivos Clave
- `lib/subscription-strategy.ts`: Lógica de períodos promocionales
- `components/free-plan-banner.tsx`: Banner visual
- `app/api/auth/register/route.ts`: Asignación automática al registrarse
- `scripts/seed-free-plan.ts`: Creación del plan gratuito

### Variables de Configuración
```typescript
const PROMOTIONAL_PERIOD = {
  enabled: true, // Cambiar a false cuando termine
  endDate: new Date('2025-06-30'),
  freePlanSlug: 'gratis-lanzamiento',
  maxFreeUsers: 1000,
}
```

## 📈 Estrategia de Conversión

### Incentivos
1. **Descuento del 20%** en el primer mes
2. **Badge "Usuario Fundador"** para primeros 100 usuarios que contraten
3. **Soporte prioritario** durante primeros 6 meses
4. **Publicación destacada gratis** en el primer mes

### Comunicación
- Email a los 23 días: "Tu período gratuito vence en 7 días"
- Email a los 30 días: "Tu período gratuito ha finalizado"
- Notificaciones en la plataforma durante los últimos 7 días

## 🚀 Próximos Pasos

1. **Integrar pasarela de pagos** (Mercado Pago, Stripe)
2. **Sistema de emails automatizados** para recordatorios
3. **Dashboard de administración** para ver métricas de conversión
4. **A/B testing** de mensajes de conversión
5. **Programa de referidos** para usuarios que contraten planes

## ⚠️ Notas Importantes

- El período promocional puede extenderse o acortarse según necesidades
- Los cupos pueden ajustarse según demanda
- Los precios de los planes pueden cambiar, pero usuarios existentes mantienen su precio
- Considerar ofertas especiales para eventos o fechas importantes

