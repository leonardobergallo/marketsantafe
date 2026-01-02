# Guía: Solar Propiedades - Ejemplo de Demo

## 📋 Resumen

Este documento explica cómo usar el ejemplo de **Solar Propiedades** para demostrar la funcionalidad multi-inmobiliaria al cliente.

## 🚀 Pasos para Configurar

### 1. Crear Usuario de Solar Propiedades

Ejecuta el script para crear el usuario:

```bash
npm run db:create-solar-user
```

Esto creará un usuario con:
- **Email:** `solar@propiedades.com`
- **Password:** `solar123`
- **Nombre:** Solar Propiedades
- **Tipo:** Negocio (is_business = true)

### 2. Iniciar Sesión

1. Ve a: `http://localhost:3000/login`
2. Ingresa:
   - Email: `solar@propiedades.com`
   - Password: `solar123`
3. Serás redirigido a `/inmobiliaria-en-equipo`

## 🏢 Datos de Solar Propiedades

### Información de la Inmobiliaria

- **Nombre:** Solar Propiedades
- **WhatsApp:** +54 9 342 512-3456
- **Email:** info@solarpropiedades.com
- **ID:** `agency-002`

### Propiedades Asignadas (Ejemplo)

Las siguientes propiedades están asignadas a Solar Propiedades en el sistema de ejemplo:

1. **Monoambiente amoblado – Recoleta Santa Fe**
   - Precio: $45,000
   - Operación: Alquiler
   - ID: prop-003

2. **Casa moderna 3 dormitorios – Barrio Sur**
   - Precio: $180,000
   - Operación: Venta
   - ID: prop-005

3. **Departamento 1 dormitorio – Centro**
   - Precio: $55,000
   - Operación: Alquiler
   - ID: prop-006

## 🎯 Flujo de Demostración

### Para el Cliente (Vista Pública)

1. **Ver Propiedades:**
   - Ir a: `http://localhost:3000/propiedades`
   - Verás el listado de todas las propiedades

2. **Ver Detalle de Propiedad de Solar:**
   - Click en cualquier propiedad
   - Si la propiedad está asignada a Solar Propiedades, verás:
     - Logo y nombre de "Solar Propiedades"
     - Botón de WhatsApp de Solar Propiedades
     - Formulario de consulta que deriva el lead a Solar

3. **Enviar Consulta:**
   - Completar el formulario en el detalle de propiedad
   - El lead se registra y se asigna a Solar Propiedades

### Para Solar Propiedades (Vista Interna)

1. **Dashboard Principal:**
   - Ir a: `http://localhost:3000/inmobiliaria-en-equipo`
   - Verás 3 tabs:
     - **Mis Propiedades:** Lista de propiedades publicadas
     - **Leads:** Consultas recibidas (cuando lleguen)
     - **Inmobiliarias:** Lista de inmobiliarias asociadas (incluye Solar)

2. **Ver Inmobiliarias:**
   - Tab "Inmobiliarias"
   - Verás Solar Propiedades con:
     - Logo (si existe)
     - Nombre
     - WhatsApp
     - Email

3. **Gestionar Propiedades:**
   - Tab "Mis Propiedades"
   - Verás tus propiedades publicadas
   - Puedes asignar/desasignar inmobiliarias (solo UI por ahora)

## 📝 Notas Importantes

### Estado Actual

- **Base de Datos:** No existe tabla `agencies` ni campo `agencyId` en `properties`
- **Fallback:** Se usan datos hardcodeados en `lib/mocks/exampleData.ts`
- **Mapeo Temporal:** Las propiedades se asignan a agencies según reglas simples (ID o professional_service)

### Para Producción

Cuando se implemente la base de datos real:

1. Crear tabla `agencies` con:
   - id, name, whatsapp, email, logoUrl
   
2. Agregar campo `agency_id` a tabla `properties`

3. Actualizar las APIs para consultar la DB en lugar de usar fallback

4. El mapeo automático se reemplazará por la relación real en la DB

## 🔧 Comandos Útiles

```bash
# Crear usuario Solar
npm run db:create-solar-user

# Verificar que se creó
# (ejecutar query en DB o ver en /api/auth/me después de login)
```

## 📞 Contacto de Ejemplo

- **Solar Propiedades**
  - WhatsApp: +54 9 342 512-3456
  - Email: info@solarpropiedades.com

---

**Nota:** Este es un ejemplo de demostración. Los datos reales se cargarán cuando se implemente la base de datos completa.



