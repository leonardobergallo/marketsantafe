# Sistema de Leads/Wizard Multi-Tenant

Sistema completo de gestión de leads con formularios wizard paso a paso, diseñado para multi-tenant (múltiples inmobiliarias).

## ✅ Implementado

### 1. Base de Datos
- ✅ Tabla `tenants` - Inmobiliarias
- ✅ Tabla `users` - Extendida con `tenant_id` y `role`
- ✅ Tabla `properties` - Extendida con `tenant_id`
- ✅ Tabla `leads` - Leads/consultas
- ✅ Tabla `lead_steps` - Autosave de pasos del wizard
- ✅ Tabla `notifications` - Notificaciones por tenant

**Migración:** Ejecutar `npm run db:add-leads-system`

### 2. Endpoints API

#### Leads
- `POST /api/leads/init` - Inicializar lead (crear en estado draft)
- `PATCH /api/leads/:id/step` - Guardar paso del wizard (autosave)
- `GET /api/leads/:id/resume` - Obtener estado del wizard para reanudar
- `POST /api/leads/:id/submit` - Enviar lead (cambiar a estado "new")
- `GET /api/leads/:id` - Obtener lead
- `PATCH /api/leads/:id` - Actualizar lead (estado, asignación)

#### Bandejas
- `GET /api/tenant/:tenantId/leads` - Bandeja de leads por tenant
- `GET /api/admin/leads` - Bandeja global (market admin)

### 3. Componentes

#### `LeadsWizardForm`
Componente wizard completo con:
- ✅ Autosave en cada paso
- ✅ Reanudación de formulario
- ✅ Validaciones por paso
- ✅ Barra de progreso
- ✅ Navegación atrás/siguiente
- ✅ Soporte para 5 flujos: ALQUILAR, COMPRAR, VENDER, TASACION, CONTACTO

**Uso:**
```tsx
import { LeadsWizardForm } from '@/components/leads-wizard-form'

<LeadsWizardForm
  open={isOpen}
  onOpenChange={setIsOpen}
  tenantId={123} // Opcional
  propertyId={456} // Opcional (si viene de una propiedad)
  flowType="ALQUILAR"
  source="web:property"
/>
```

### 4. Dashboards

#### Tenant Dashboard
- ✅ Página `/tenant/leads` - Bandeja de leads
- ✅ Filtros por estado, flujo, zona
- ✅ Tabla con información de leads
- ✅ Enlace a detalle de lead

## 📋 Pendiente (Para completar)

### Endpoints adicionales
- [ ] CRUD de tenants (`/api/admin/tenants`)
- [ ] Gestión de usuarios por tenant
- [ ] Endpoint de detalle de lead completo
- [ ] Endpoint para cambiar estado/asignar lead

### Dashboards
- [ ] Dashboard Market Admin completo
  - [ ] CRUD de tenants
  - [ ] Vista global de leads
  - [ ] Métricas y estadísticas
- [ ] Página de detalle de lead (`/tenant/leads/:id`)
- [ ] Página de edición de lead

### Funcionalidades adicionales
- [ ] Notificaciones en tiempo real
- [ ] Exportar CSV de leads
- [ ] Asignación de leads a asesores
- [ ] Historial de cambios de estado
- [ ] Integración con WhatsApp/Email

## 🔧 Configuración de Flujos

Los pasos del wizard están configurados en `lib/wizard-config-simple.ts`.

### Flujo ALQUILAR
1. Zona (con opción "Otro")
2. Tipo de propiedad
3. Presupuesto mensual
4. Dormitorios (opcional)
5. Nombre
6. WhatsApp
7. Email (opcional)

### Flujo COMPRAR
1. Zona (con opción "Otro")
2. Tipo de propiedad
3. Presupuesto mínimo
4. Presupuesto máximo
5. Dormitorios (opcional)
6. Nombre
7. WhatsApp
8. Email (opcional)

### Flujo VENDER / TASACION
1. Dirección
2. Tipo de propiedad
3. Metros cuadrados (opcional)
4. Estado
5. Nombre
6. WhatsApp
7. Email (opcional)

### Flujo CONTACTO
1. Nombre
2. WhatsApp
3. Mensaje (opcional)

## 🔐 Autenticación y Autorización

El sistema utiliza roles:
- `market_admin` - Acceso total al marketplace
- `tenant_admin` - Admin de una inmobiliaria
- `tenant_agent` - Agente/asesor de una inmobiliaria
- `user` - Usuario regular

Helpers en `lib/auth-tenant.ts`:
- `getCurrentUserWithRole()` - Obtener usuario con role y tenant_id
- `requireMarketAdmin()` - Requerir market admin
- `requireTenantUser()` - Requerir tenant admin/agent
- `canAccessTenant(tenantId)` - Verificar acceso a tenant

## 📝 Ejemplo de Uso Completo

```tsx
'use client'

import { useState } from 'react'
import { LeadsWizardForm } from '@/components/leads-wizard-form'
import { Button } from '@/components/ui/button'

export function PropertyContactButton({ propertyId, tenantId }: { propertyId: number, tenantId?: number }) {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setWizardOpen(true)}>
        Contactar sobre esta propiedad
      </Button>
      
      <LeadsWizardForm
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        tenantId={tenantId}
        propertyId={propertyId}
        flowType="ALQUILAR"
        source="web:property"
      />
    </>
  )
}
```

## 🚀 Próximos Pasos

1. Completar dashboard Market Admin
2. Agregar página de detalle de lead
3. Implementar CRUD de tenants
4. Agregar notificaciones push
5. Implementar exportación CSV
6. Agregar métricas y gráficos


