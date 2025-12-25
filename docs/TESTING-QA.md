# 📋 Guía de Testing QA - MarketSantaFe

Este documento contiene toda la información necesaria para realizar pruebas de QA en la plataforma MarketSantaFe.

## 🔑 Credenciales de Acceso

**Todos los usuarios tienen la misma contraseña:** `password123`

### Usuarios Particulares
| Email | Nombre | Plan | Descripción |
|-------|--------|------|--------------|
| `juan.perez@qa.test` | Juan Pérez | Plan Particular ($5,000) | Usuario con productos publicados |
| `maria.gonzalez@qa.test` | María González | Plan Particular ($5,000) | Usuario con productos publicados |
| `carlos.rodriguez@qa.test` | Carlos Rodríguez | Plan Particular ($5,000) | Usuario con productos publicados |

### Usuarios de Negocio (Restaurantes)
| Email | Nombre | Plan | Descripción |
|-------|--------|------|--------------|
| `pizzeria@qa.test` | Pizzería El Buen Sabor | Plan Bar/Restaurante ($15,000) | Restaurante con menú completo |
| `restaurante@qa.test` | Restaurante La Esquina | Plan Bar/Restaurante ($15,000) | Restaurante con menú completo |
| `cafe@qa.test` | Café Central | Plan Bar/Restaurante ($15,000) | Cafetería con menú completo |

### Agentes Inmobiliarios
| Email | Nombre | Plan | Descripción |
|-------|--------|------|--------------|
| `agente@qa.test` | Agente Inmobiliario Test | Plan Agente Inmobiliario ($25,000) | Agente con propiedades publicadas |
| `inmobiliaria@qa.test` | Inmobiliaria Santa Fe | Plan Agente Inmobiliario ($25,000) | Inmobiliaria con propiedades publicadas |

---

## 📊 Datos de Ejemplo Disponibles

### Productos/Listings (5)
1. **iPhone 13 Pro Max 256GB** - $850,000 (Juan Pérez)
2. **Sofá 3 cuerpos beige** - $120,000 (María González)
3. **Bicicleta Mountain Bike** - $95,000 (Carlos Rodríguez)
4. **Notebook Dell Inspiron 15** - $350,000 (Juan Pérez)
5. **Zapatillas Nike Air Max** - $45,000 (María González)

### Propiedades Inmobiliarias (14)

#### Alquileres (6)
1. **Departamento 2 ambientes en Centro** - $150,000/mes - Agente Inmobiliario
2. **Casa 3 dormitorios en Barrio Norte** - $250,000/mes - Inmobiliaria Santa Fe
3. **Departamento 1 ambiente en Centro** - $120,000/mes - Agente Inmobiliario
4. **Casa 4 dormitorios con piscina** - $350,000/mes - Inmobiliaria Santa Fe
5. **Local comercial en Centro** - $180,000/mes - Agente Inmobiliario
6. **Departamento 3 ambientes en Barrio Sur** - $200,000/mes - Inmobiliaria Santa Fe

#### Ventas (8)
1. **Terreno 500m² en Barrio Sur** - $3,500,000 - Agente Inmobiliario
2. **Casa en venta 3 dormitorios** - $85,000,000 - Inmobiliaria Santa Fe
3. **Departamento 2 ambientes en venta** - $45,000,000 - Agente Inmobiliario
4. **Terreno 300m² en Centro** - $28,000,000 - Inmobiliaria Santa Fe
5. **Casa 5 dormitorios con quincho** - $120,000,000 - Agente Inmobiliario
6. **Local comercial en venta** - $55,000,000 - Inmobiliaria Santa Fe
7. **Terreno 800m² en Barrio Norte** - $42,000,000 - Agente Inmobiliario
8. **Departamento 3 ambientes en venta** - $65,000,000 - Inmobiliaria Santa Fe

### Restaurantes (3)
1. **Pizzería El Buen Sabor** - Centro
   - Pizza Muzzarella - $3,500
   - Pizza Napolitana - $4,200
   - Pizza Especial - $4,800

2. **Restaurante La Esquina** - Barrio Norte
   - Milanesa con papas - $4,500
   - Pollo al horno - $5,000

3. **Café Central** - Centro
   - Café con leche - $800
   - Medialunas - $600
   - Tostado mixto - $1,200

---

## ✅ Checklist de Funcionalidades

### 🔐 Autenticación y Registro
- [ ] Registro de usuario particular
- [ ] Registro de usuario negocio
- [ ] Inicio de sesión con email y contraseña
- [ ] Cerrar sesión
- [ ] Recuperación de contraseña (si está implementado)
- [ ] Verificación de email (si está implementado)

### 👤 Perfil de Usuario
- [ ] Ver perfil propio
- [ ] Editar información personal
- [ ] Cambiar contraseña
- [ ] Subir avatar
- [ ] Ver suscripciones activas

### 💳 Suscripciones
- [ ] Ver suscripción activa
- [ ] Ver historial de pagos
- [ ] Ver planes disponibles
- [ ] Cambiar de plan (si está implementado)
- [ ] Ver días restantes de suscripción
- [ ] Banner de plan gratuito (si aplica)

### 📦 Publicación de Productos (Mercado)
- [ ] Publicar un producto nuevo
- [ ] Editar producto publicado
- [ ] Eliminar producto
- [ ] Subir múltiples imágenes
- [ ] Publicación masiva desde Excel
- [ ] Ver mis publicaciones en "Mis ventas"

### 🏠 Publicación de Propiedades (Inmobiliaria)
- [ ] Publicar propiedad (alquiler/venta/terreno)
- [ ] Editar propiedad
- [ ] Eliminar propiedad
- [ ] Importación masiva desde Excel
- [ ] Ver mis propiedades en "Mis propiedades"

### 🍔 Gestión de Restaurantes
- [ ] Crear restaurante
- [ ] Editar información del restaurante
- [ ] Agregar items al menú
- [ ] Editar items del menú
- [ ] Eliminar items del menú
- [ ] Ver restaurante público
- [ ] Ver menú público

### 🔍 Búsqueda y Filtros
- [ ] Búsqueda de productos en mercado
- [ ] Filtros por categoría
- [ ] Filtros por zona
- [ ] Filtros por precio
- [ ] Búsqueda de propiedades en inmobiliaria
- [ ] Filtros específicos de inmobiliaria
- [ ] Búsqueda de restaurantes

### 💬 Chatbot (Inmobiliaria)
- [ ] Chatbot visible solo en página de inmobiliaria
- [ ] Chatbot oculto en otras páginas
- [ ] Inicialización del chatbot
- [ ] Envío de mensajes
- [ ] Recepción de respuestas
- [ ] Panel de administración (solo para agentes)

### 📱 Responsive Design
- [ ] Navegación en móvil
- [ ] Formularios en móvil
- [ ] Banners responsive
- [ ] Grids de productos responsive
- [ ] Menús desplegables en móvil

---

## 🧪 Casos de Prueba por Tipo de Usuario

### 👤 Usuario Particular (juan.perez@qa.test)

#### Escenario 1: Publicar un Producto
1. Iniciar sesión con `juan.perez@qa.test` / `password123`
2. Ir a "Publicar" → "Mercado"
3. Completar formulario:
   - Título: "Bicicleta de Ruta"
   - Categoría: Vehículos
   - Zona: Centro
   - Precio: $80,000
   - Condición: Usado
   - Descripción: "Bicicleta de ruta en excelente estado"
   - Subir 2-3 imágenes
4. Publicar
5. Verificar que aparece en "Mis ventas"
6. Verificar que aparece en la página de explorar

#### Escenario 2: Editar Producto
1. Ir a "Mis ventas"
2. Hacer clic en "Editar" en un producto existente
3. Modificar precio y descripción
4. Guardar cambios
5. Verificar que los cambios se reflejan

#### Escenario 3: Ver Suscripción
1. Ir a "Mis Suscripciones"
2. Verificar que muestra:
   - Plan activo: "Plan Particular"
   - Precio: $5,000
   - Estado: Activa
   - Fecha de vencimiento

### 🏢 Usuario Negocio - Restaurante (pizzeria@qa.test)

#### Escenario 1: Gestionar Menú
1. Iniciar sesión con `pizzeria@qa.test` / `password123`
2. Ir a "Comer" → Buscar "Pizzería El Buen Sabor"
3. Hacer clic en "Gestionar Menú"
4. Agregar nuevo plato:
   - Nombre: "Pizza Cuatro Quesos"
   - Precio: $5,000
   - Descripción: "Pizza con 4 tipos de queso"
   - Subir imagen
5. Guardar
6. Verificar que aparece en el menú público

#### Escenario 2: Editar Restaurante
1. Ir a "Publicar" → "Gastronomía"
2. Buscar el restaurante existente
3. Editar información (dirección, teléfono, etc.)
4. Guardar cambios

### 🏠 Agente Inmobiliario (agente@qa.test)

#### Escenario 1: Publicar Propiedad
1. Iniciar sesión con `agente@qa.test` / `password123`
2. Ir a "Inmobiliaria" → "Publicar Propiedad"
3. Completar formulario:
   - Tipo: Alquiler
   - Título: "Casa 4 ambientes"
   - Zona: Centro
   - Precio: $200,000
   - Descripción: "Casa amplia con patio"
   - Subir imágenes
4. Publicar
5. Verificar que aparece en "Mis propiedades"

#### Escenario 2: Usar Chatbot
1. Ir a página "Inmobiliaria en Equipo"
2. Verificar que el chatbot está visible (botón en esquina inferior derecha)
3. Abrir chatbot
4. Enviar mensaje: "Busco departamento en centro"
5. Verificar respuesta del chatbot

#### Escenario 3: Panel de Administración
1. Verificar que aparece "Panel Chatbot" en el menú de usuario
2. Acceder al panel
3. Verificar que muestra:
   - Estadísticas de leads
   - Lista de leads
   - Filtros por estado

#### Escenario 4: Chatbot Oculto en Otras Páginas
1. Ir a página principal (/)
2. Verificar que el chatbot NO está visible
3. Ir a "Mercado"
4. Verificar que el chatbot NO está visible
5. Ir a "Inmobiliaria en Equipo"
6. Verificar que el chatbot SÍ está visible

---

## 🐛 Problemas Comunes a Verificar

### Autenticación
- [ ] Error al iniciar sesión con credenciales incorrectas
- [ ] Error al registrar email duplicado
- [ ] Sesión expirada después de tiempo inactivo
- [ ] Cerrar sesión funciona correctamente

### Publicaciones
- [ ] Validación de campos requeridos
- [ ] Límite de imágenes (si existe)
- [ ] Precio mínimo/máximo
- [ ] Caracteres especiales en títulos/descripciones

### Suscripciones
- [ ] Banner de plan gratuito aparece correctamente
- [ ] Cálculo de días restantes
- [ ] Estado de suscripción (activa/expirada)
- [ ] Historial de pagos

### Chatbot
- [ ] No aparece en páginas que no sean inmobiliaria
- [ ] Se oculta al navegar fuera de inmobiliaria
- [ ] No muestra errores de conexión al usuario
- [ ] Funciona correctamente en página de inmobiliaria

### Responsive
- [ ] Menú hamburguesa funciona en móvil
- [ ] Formularios se adaptan a pantalla pequeña
- [ ] Imágenes no se desbordan
- [ ] Botones son accesibles en móvil

---

## 📝 Notas de Testing

### Datos de Prueba
- Todos los usuarios tienen suscripciones activas por 30 días
- Los productos y propiedades están activos y visibles
- Los restaurantes tienen menús completos
- Las coordenadas de restaurantes son reales de Santa Fe

### Ejecutar Seed Nuevamente
Si necesitás resetear los datos de prueba:
```bash
npx tsx scripts/seed-qa-data.ts
```

El script verifica si los usuarios ya existen antes de crearlos, así que podés ejecutarlo múltiples veces.

### Limpiar Datos de Prueba
Si querés eliminar todos los datos de prueba:
```bash
# Eliminar usuarios de prueba
npx tsx scripts/clean-qa-data.ts  # (si existe)
```

---

## 🎯 Prioridades de Testing

### Alta Prioridad
1. ✅ Autenticación y registro
2. ✅ Publicación de productos
3. ✅ Publicación de propiedades
4. ✅ Gestión de menús de restaurantes
5. ✅ Suscripciones y planes

### Media Prioridad
1. ✅ Búsqueda y filtros
2. ✅ Edición de publicaciones
3. ✅ Responsive design
4. ✅ Panel de administración del chatbot

### Baja Prioridad
1. ✅ Chatbot (funcionalidad avanzada)
2. ✅ Importación masiva
3. ✅ Estadísticas y reportes

---

## 📞 Contacto

Si encontrás bugs o tenés preguntas sobre el testing, documentá el problema con:
- Descripción del bug
- Pasos para reproducir
- Resultado esperado vs. resultado actual
- Screenshots (si aplica)
- Navegador y versión
- Sistema operativo

---

**Última actualización:** $(date)
**Versión del script:** 1.0.0

