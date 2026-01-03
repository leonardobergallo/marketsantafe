# Guía Completa: Cómo Funciona el Sistema de Leads/Wizard

## 🎯 Concepto General

El sistema reemplaza un chatbot conversacional por un **formulario wizard (paso a paso)** que:
- Guía al usuario paso a paso
- Guarda automáticamente cada respuesta (autosave)
- Permite reanudar si el usuario se va y vuelve
- Enruta los leads a la inmobiliaria correcta

---

## 📊 Flujo Completo

### 1. Usuario Abre el Formulario

Cuando un usuario quiere alquilar/comprar/vender, se abre el componente `LeadsWizardForm`:

```tsx
<LeadsWizardForm
  open={true}
  tenantId={123}              // ¿De qué inmobiliaria? (opcional)
  propertyId={456}            // ¿Sobre qué propiedad? (opcional)
  flowType="ALQUILAR"        // Tipo de flujo
  source="web:property"       // Origen (desde dónde vino)
/>
```

**Casos de uso:**
- **Desde una propiedad**: `propertyId` está definido → El sistema obtiene el `tenantId` de esa propiedad
- **Desde landing de inmobiliaria**: `tenantId` está definido
- **Desde marketplace general**: Ninguno definido → Se asigna al tenant "Marketplace"

---

### 2. Inicialización del Lead

**Endpoint:** `POST /api/leads/init`

Cuando se abre el wizard, automáticamente:

1. Se crea un registro en la tabla `leads` con estado `"draft"` (borrador)
2. Se guarda:
   - `tenant_id` (a qué inmobiliaria pertenece)
   - `property_id` (si aplica)
   - `flow_type` (ALQUILAR, COMPRAR, etc.)
   - `user_type` (buyer/seller, se deduce automáticamente)
   - `source` (web:property, web:home, etc.)
   - `status = "draft"` (todavía no está completo)

3. Se devuelve el `lead_id` al frontend

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "lead": {
    "id": 123,
    "tenant_id": 5,
    "property_id": 456,
    "flow_type": "ALQUILAR",
    "status": "draft"
  }
}
```

---

### 3. Usuario Completa Pasos (con Autosave)

**Endpoint:** `PATCH /api/leads/:id/step`

El usuario va completando el formulario paso a paso:

#### Paso 1: Zona
- Usuario selecciona "Centro"
- **Automáticamente se guarda:**
  - En `lead_steps`: `{ lead_id: 123, step_key: "zona", value: "Centro" }`
  - En `leads`: `zone = "Centro"` (campo actualizado)

#### Paso 2: Tipo de Propiedad
- Usuario selecciona "Departamento"
- Se guarda igual que el paso 1

#### Paso 3: Presupuesto
- Usuario escribe "50000"
- Se guarda: `budget = 50000`

**Características del autosave:**
- Cada vez que el usuario cambia un campo, se guarda automáticamente
- No necesita hacer "Guardar" manualmente
- Si cierra el formulario y vuelve, puede reanudar desde donde quedó

---

### 4. Reanudar Formulario (si el usuario vuelve)

**Endpoint:** `GET /api/leads/:id/resume`

Si el usuario cierra el wizard y vuelve después:

1. El sistema busca el `lead_id` (puede guardarse en localStorage o venir de URL)
2. Llama a `/api/leads/:id/resume`
3. Obtiene:
   - Todos los datos guardados en `lead_steps`
   - Datos consolidados en `leads`
4. Restaura el formulario con los valores guardados
5. Coloca al usuario en el último paso completado

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "lead": {
    "id": 123,
    "status": "draft",
    "zone": "Centro",
    "property_type": "Departamento",
    "budget": 50000
  },
  "steps": {
    "zona": "Centro",
    "tipo": "Departamento",
    "presupuesto": "50000"
  }
}
```

---

### 5. Validaciones por Paso

Cada paso tiene validaciones:

- **Campo requerido**: No puede avanzar si está vacío
- **Validación personalizada**: 
  - Email: Formato válido
  - Teléfono: 10-15 dígitos
  - Presupuesto: Debe ser mayor a 0
  - Presupuesto máximo: Debe ser mayor al mínimo

**Ejemplo:**
```tsx
{
  key: 'presupuesto',
  label: 'Presupuesto mensual',
  type: 'number',
  required: true,
  validation: (value) => {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) {
      return 'El presupuesto debe ser mayor a 0'
    }
    return null // Sin error
  }
}
```

---

### 6. Envío Final del Lead

**Endpoint:** `POST /api/leads/:id/submit`

Cuando el usuario completa todos los pasos y hace clic en "Enviar":

1. **Validación final**: Se validan todos los pasos requeridos
2. **Consolidación de datos**: Todos los datos se guardan en `leads`:
   - `name`, `email`, `whatsapp`
   - `zone`, `property_type`, `budget`, etc.
3. **Cambio de estado**: `status = "draft"` → `status = "new"`
4. **Timestamp**: Se guarda `submitted_at = CURRENT_TIMESTAMP`
5. **Notificación**: Se crea una notificación para el tenant
6. **Respuesta exitosa**: El usuario ve "Lead enviado exitosamente"

**Ejemplo de body enviado:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "3425123456",
  "email": "juan@email.com",
  "zona": "Centro",
  "tipo": "Departamento",
  "presupuesto": "50000",
  "dormitorios": "2"
}
```

---

## 🏢 Multi-Tenant: Cómo se Enrutan los Leads

### Caso 1: Lead desde una Propiedad

```
Usuario está viendo propiedad ID 456
  ↓
La propiedad pertenece a tenant_id = 5 (Solar Propiedades)
  ↓
El lead se crea con tenant_id = 5
  ↓
El lead llega a la bandeja de Solar Propiedades
```

### Caso 2: Lead desde Landing de Inmobiliaria

```
Usuario está en landing de Solar Propiedades (tenant_id = 5)
  ↓
El formulario se abre con tenantId = 5
  ↓
El lead se crea con tenant_id = 5
  ↓
El lead llega a la bandeja de Solar Propiedades
```

### Caso 3: Lead desde Marketplace General

```
Usuario está en la home del marketplace
  ↓
No hay tenant_id específico
  ↓
El lead se crea con tenant_id = 1 (Marketplace por defecto)
  ↓
El Market Admin puede verlo y redistribuirlo
```

---

## 📬 Bandejas de Leads

### Bandeja Tenant (Inmobiliaria)

**Ruta:** `/tenant/leads`

**Endpoint:** `GET /api/tenant/:tenantId/leads`

**Filtros disponibles:**
- `status`: new, contacted, qualified, closed, discarded
- `flow_type`: ALQUILAR, COMPRAR, VENDER, etc.
- `zone`: Buscar por zona
- `property_id`: Leads de una propiedad específica
- `assigned_to`: Leads asignados a un asesor

**Lo que ve la inmobiliaria:**
- Lista de todos sus leads
- Información de contacto (nombre, WhatsApp, email)
- Tipo de flujo y zona
- Estado del lead
- Fecha de creación

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "leads": [
    {
      "id": 123,
      "name": "Juan Pérez",
      "whatsapp": "3425123456",
      "flow_type": "ALQUILAR",
      "zone": "Centro",
      "status": "new",
      "created_at": "2026-01-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50
  }
}
```

### Bandeja Market Admin (Vista Global)

**Endpoint:** `GET /api/admin/leads`

**Diferencia:**
- Ve leads de TODOS los tenants
- Incluye información de qué tenant es cada lead
- Puede filtrar por tenant específico

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "leads": [
    {
      "id": 123,
      "tenant_id": 5,
      "tenant_name": "Solar Propiedades",
      "name": "Juan Pérez",
      "flow_type": "ALQUILAR",
      "status": "new"
    }
  ]
}
```

---

## 🔐 Autenticación y Permisos

### Roles

1. **Market Admin** (`market_admin`)
   - Ve todo el marketplace
   - Puede ver leads de todos los tenants
   - Puede gestionar tenants, usuarios, propiedades

2. **Tenant Admin** (`tenant_admin`)
   - Ve solo los leads de su inmobiliaria
   - Puede gestionar usuarios de su tenant
   - Puede cambiar estado de leads

3. **Tenant Agent** (`tenant_agent`)
   - Ve solo los leads de su inmobiliaria
   - Puede cambiar estado de leads asignados a él

### Ejemplo de Verificación

```tsx
// En un endpoint
const user = await requireTenantUser()
if (!user) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
}

// Solo puede ver leads de su tenant
const leads = await getLeadsByTenant(user.tenant_id)
```

---

## 📋 Estructura de Datos

### Tabla `leads`

```sql
id                SERIAL PRIMARY KEY
tenant_id         INTEGER  -- ¿A qué inmobiliaria pertenece?
property_id       INTEGER  -- ¿De qué propiedad? (opcional)
flow_type         VARCHAR  -- ALQUILAR, COMPRAR, VENDER, TASACION, CONTACTO
user_type         VARCHAR  -- buyer o seller
source            VARCHAR  -- web:property, web:home, ads, etc.
status            VARCHAR  -- draft, new, contacted, qualified, closed, discarded

-- Datos de contacto
name              VARCHAR
email             VARCHAR
whatsapp          VARCHAR

-- Datos del formulario
zone              VARCHAR
property_type     VARCHAR
budget_min        DECIMAL
budget_max        DECIMAL
budget            DECIMAL
bedrooms          INTEGER
area_m2           DECIMAL
condition         VARCHAR
address           TEXT

-- Metadata
assigned_to_user_id INTEGER  -- ¿Asignado a qué asesor?
created_at        TIMESTAMP
updated_at        TIMESTAMP
submitted_at      TIMESTAMP  -- ¿Cuándo se envió?
```

### Tabla `lead_steps`

```sql
id          SERIAL PRIMARY KEY
lead_id     INTEGER  -- Referencia al lead
step_key    VARCHAR  -- "zona", "tipo", "presupuesto", etc.
value       TEXT     -- Valor guardado (puede ser JSON)
created_at  TIMESTAMP
updated_at  TIMESTAMP

UNIQUE(lead_id, step_key)  -- Un solo valor por step por lead
```

**Ejemplo de datos:**
```
lead_id | step_key      | value
--------|---------------|----------
123     | zona          | "Centro"
123     | tipo          | "Departamento"
123     | presupuesto   | "50000"
123     | nombre        | "Juan Pérez"
```

---

## 🎨 Componente WizardForm: Cómo Funciona Internamente

### Estados del Componente

```tsx
const [leadId, setLeadId] = useState<number | null>(null)
const [currentStep, setCurrentStep] = useState(0)  // Paso actual (0, 1, 2...)
const [formData, setFormData] = useState({})        // Todos los valores del formulario
const [errors, setErrors] = useState({})            // Errores de validación
```

### Flujo Interno

1. **Al abrir el modal:**
   ```tsx
   useEffect(() => {
     if (open && !leadId) {
       initializeLead()  // POST /api/leads/init
     }
   }, [open])
   ```

2. **Al obtener leadId:**
   ```tsx
   useEffect(() => {
     if (leadId) {
       loadLeadState()  // GET /api/leads/:id/resume
     }
   }, [leadId])
   ```

3. **Al cambiar un campo:**
   ```tsx
   const handleFieldChange = (stepKey, value) => {
     setFormData(prev => ({ ...prev, [stepKey]: value }))
     saveStep(stepKey, value)  // PATCH /api/leads/:id/step
   }
   ```

4. **Al hacer "Siguiente":**
   ```tsx
   const handleNext = () => {
     if (validateStep(currentStep)) {
       setCurrentStep(currentStep + 1)
     }
   }
   ```

5. **Al hacer "Enviar":**
   ```tsx
   const handleSubmit = async () => {
     // Validar todos los pasos
     // POST /api/leads/:id/submit
     // Mostrar mensaje de éxito
   }
   ```

---

## 🔄 Flujo Completo Visual

```
1. Usuario hace clic en "Contactar"
   ↓
2. Se abre LeadsWizardForm
   ↓
3. POST /api/leads/init → Se crea lead con status="draft"
   ↓
4. Usuario completa Paso 1: Zona
   → PATCH /api/leads/:id/step → Se guarda en lead_steps y leads
   ↓
5. Usuario completa Paso 2: Tipo
   → PATCH /api/leads/:id/step → Se guarda
   ↓
6. ... (continúa con todos los pasos)
   ↓
7. Usuario cierra el formulario (sin enviar)
   → Los datos quedan guardados en la BD
   ↓
8. Usuario vuelve al formulario (mismo lead_id)
   → GET /api/leads/:id/resume → Se cargan los datos guardados
   → El formulario se restaura en el último paso
   ↓
9. Usuario completa los pasos restantes
   ↓
10. Usuario hace clic en "Enviar"
    → POST /api/leads/:id/submit
    → status cambia a "new"
    → Se crea notificación para el tenant
    → Usuario ve "Lead enviado exitosamente"
    ↓
11. La inmobiliaria ve el lead en su bandeja
    → GET /api/tenant/:tenantId/leads
    → Aparece en /tenant/leads
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Lead desde una Propiedad

```tsx
// En la página de detalle de propiedad
function PropertyDetailPage({ property }) {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setWizardOpen(true)}>
        Contactar sobre esta propiedad
      </Button>

      <LeadsWizardForm
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        propertyId={property.id}  // El sistema obtiene tenant_id de la propiedad
        flowType="ALQUILAR"
        source="web:property"
      />
    </>
  )
}
```

### Ejemplo 2: Lead desde Landing de Inmobiliaria

```tsx
// En /inmobiliaria/[slug]
function InmobiliariaLandingPage({ tenant }) {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setWizardOpen(true)}>
        Buscar propiedades
      </Button>

      <LeadsWizardForm
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        tenantId={tenant.id}  // Directamente del tenant de la landing
        flowType="COMPRAR"
        source="web:landing"
      />
    </>
  )
}
```

---

## ✅ Ventajas del Sistema

1. **Autosave**: El usuario no pierde información si cierra el formulario
2. **Multi-tenant**: Cada lead va a la inmobiliaria correcta automáticamente
3. **Rastreable**: Se sabe de dónde vino cada lead (source)
4. **Escalable**: Fácil agregar nuevos pasos o flujos
5. **Validado**: Validaciones en cada paso antes de avanzar
6. **Reanudable**: Puede retomar desde donde quedó

---

¿Te queda claro algún punto específico o querés que profundice en alguna parte?


