# Importación Masiva V2 - Con Imágenes por Nombre Original

## 📋 Formato del Excel

### Columnas OBLIGATORIAS

| Columna | Tipo | Ejemplo | Validación |
|---------|------|---------|------------|
| **titulo** | Texto | "iPhone 13 Pro Max 256GB" | Mínimo 5 caracteres |
| **categoria** | Texto | "Tecnología" | Ver lista de categorías válidas |
| **zona** | Texto | "Centro" | Ver lista de zonas válidas |
| **descripcion** | Texto | "iPhone en excelente estado..." | Mínimo 10 caracteres |
| **foto_principal** | Texto | "IMG_2561.JPG" | Nombre exacto del archivo en /public/uploads/ |

### Columnas OPCIONALES

| Columna | Tipo | Ejemplo | Notas |
|---------|------|---------|-------|
| **precio** | Número | "450000" o "450000.50" | Sin símbolos de moneda |
| **moneda** | Texto | "ARS" o "USD" | Por defecto: ARS |
| **condicion** | Texto | "Nuevo" o "Usado" | Solo estos valores |
| **whatsapp** | URL | "https://wa.me/5493425123456" | URL completa de WhatsApp |
| **telefono** | Texto | "3425-123456" | Formato: 3425-123456 |
| **email** | Texto | "contacto@ejemplo.com" | Email válido |
| **instagram** | Texto | "@usuario" o "usuario" | Con o sin @ |
| **foto_2** | Texto | "WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg" | Nombre exacto del archivo |
| **foto_3** | Texto | "IMG_2562.JPG" | Nombre exacto del archivo |
| **foto_4** | Texto | "foto_producto.jpg" | Nombre exacto del archivo |

## 📁 Ubicación de Imágenes

**Todas las imágenes deben estar en:**
```
/public/uploads/
```

**Reglas importantes:**
- ✅ Las imágenes **NO se renombran**
- ✅ Las imágenes **NO se mueven**
- ✅ Se usan los nombres originales tal cual están
- ✅ El sistema construye la URL: `/uploads/nombre_archivo.jpg`

## 📊 Ejemplo de Excel

| titulo | categoria | zona | descripcion | precio | moneda | condicion | whatsapp | foto_principal | foto_2 |
|--------|-----------|------|-------------|--------|--------|-----------|----------|----------------|--------|
| iPhone 13 Pro Max | Tecnología | Centro | iPhone en excelente estado, con caja original | 450000 | ARS | Usado | https://wa.me/5493425123456 | IMG_2561.JPG | WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg |
| Departamento 2 ambientes | Alquileres | Barrio Sur | Hermoso departamento completamente amueblado | 85000 | ARS | Nuevo | https://wa.me/5493425789012 | IMG_2562.JPG | |

## 🔄 Flujo de Importación

### Paso 1: Subir Imágenes
1. Sube **todas las imágenes** a `/public/uploads/`
2. Mantén los nombres originales (ej: `IMG_2561.JPG`, `WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg`)

### Paso 2: Preparar Excel
1. Crea tu Excel con las columnas requeridas
2. En `foto_principal`, `foto_2`, etc., pon el **nombre exacto** del archivo
3. Ejemplo: Si el archivo se llama `IMG_2561.JPG`, pon exactamente `IMG_2561.JPG`

### Paso 3: Importar
1. Ve a `/publicar/masivo`
2. Selecciona "Importar desde Excel"
3. Sube tu archivo Excel
4. El sistema mostrará un **preview** con:
   - Lista de productos válidos
   - Imágenes encontradas/no encontradas
   - Errores de validación
5. Revisa el preview y confirma
6. Los productos se crearán automáticamente

## ⚠️ Validaciones

### Validaciones Estrictas
- ✅ `foto_principal` es **obligatoria**
- ✅ `precio` debe ser numérico (si está presente)
- ✅ `moneda` solo ARS o USD
- ✅ `condicion` solo "Nuevo" o "Usado"
- ✅ `whatsapp` debe ser URL completa (ej: `https://wa.me/5493425123456`)

### Warnings (No bloquean la importación)
- ⚠️ Si una imagen indicada no existe en `/public/uploads/`, se muestra un warning
- ⚠️ El producto se crea igual, pero sin esa imagen

## 🎯 Ejemplo Real

**Archivos en `/public/uploads/`:**
```
IMG_2561.JPG
WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg
IMG_2562.JPG
```

**Excel:**
```
titulo: iPhone 13 Pro Max
foto_principal: IMG_2561.JPG
foto_2: WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg
```

**Resultado en la base de datos:**
```json
{
  "image_url": "/uploads/IMG_2561.JPG",
  "images": [
    "/uploads/IMG_2561.JPG",
    "/uploads/WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg"
  ]
}
```

## 📂 Categorías Válidas

1. Alquileres
2. Inmuebles
3. Vehículos
4. Tecnología
5. Hogar y Muebles
6. Servicios
7. Electrodomésticos
8. Ropa y Accesorios
9. Deportes
10. Mascotas

## 🗺️ Zonas Válidas

1. Centro
2. Barrio Sur
3. Barrio Norte
4. San Martín
5. Villa María Selva
6. Barranquitas
7. San Agustín
8. Candioti
9. 7 Jefes
10. Alto Verde
11. Toda la ciudad

## 🔧 Endpoint API

**POST** `/api/publish/listing/import-excel-v2`

**Body (FormData):**
- `file`: Archivo Excel (.xlsx, .xls, .csv)
- `previewOnly`: "true" para solo preview, "false" para importar
- `defaultWhatsapp`: (opcional) WhatsApp por defecto
- `defaultPhone`: (opcional) Teléfono por defecto
- `defaultEmail`: (opcional) Email por defecto
- `defaultInstagram`: (opcional) Instagram por defecto

**Response (previewOnly=true):**
```json
{
  "preview": true,
  "total": 10,
  "valid": 8,
  "errors": 2,
  "listings": [...],
  "errorsDetails": [...]
}
```

**Response (previewOnly=false):**
```json
{
  "message": "Importación completada: 8 exitosos, 2 con errores",
  "success": 8,
  "validationErrors": 1,
  "insertErrors": 1,
  "results": [...],
  "validationErrorsDetails": [...],
  "insertErrorsDetails": [...]
}
```

