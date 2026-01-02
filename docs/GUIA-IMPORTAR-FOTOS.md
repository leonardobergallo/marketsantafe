# Guía Completa: Importación de Fotos desde Excel

Esta guía explica cómo preparar y subir fotos cuando importás productos o propiedades desde Excel.

## 📋 Tabla de Contenidos

1. [Formato de las Fotos](#formato-de-las-fotos)
2. [Ubicación de los Archivos](#ubicación-de-los-archivos)
3. [Columnas en el Excel](#columnas-en-el-excel)
4. [Nombres de Archivos](#nombres-de-archivos)
5. [Usando URLs Completas](#usando-urls-completas)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Solución de Problemas](#solución-de-problemas)

## 📸 Formato de las Fotos

### Formatos Aceptados

- **Imágenes**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Recomendado**: JPG para menor tamaño de archivo

### Tamaño Recomendado

- **Dimensiones**: Mínimo 800x600 píxeles, recomendado 1200x900 o más
- **Peso máximo**: 5 MB por imagen
- **Calidad**: Buena calidad pero optimizada (no ultra alta resolución)

## 📁 Ubicación de los Archivos

### Para Fotos Locales (Recomendado)

Las fotos deben estar en la carpeta `public/uploads/` de tu proyecto.

**Estructura de carpetas:**
```
tu-proyecto/
  ├── public/
  │   └── uploads/
  │       ├── IMG_2561.JPG
  │       ├── IMG_2562.JPG
  │       ├── producto1.jpg
  │       ├── propiedad1.jpg
  │       └── ...
```

**Importante:**
- Las fotos deben estar en `public/uploads/` ANTES de importar el Excel
- El sistema buscará las fotos por su nombre exacto
- Los nombres de archivo distinguen entre mayúsculas y minúsculas

### Para Fotos con URLs Externas

También podés usar URLs completas de imágenes alojadas en otros servidores.

**Ejemplos de URLs válidas:**
- `https://ejemplo.com/fotos/producto1.jpg`
- `http://mi-servidor.com/imagenes/propiedad1.png`
- `https://cloudinary.com/ejemplo/foto.jpg`

## 📊 Columnas en el Excel

### Para Productos

En tu archivo Excel, podés usar estas columnas para las fotos:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `foto_principal` | Foto principal del producto (obligatoria si querés imágenes) | `IMG_2561.JPG` |
| `foto_2` | Segunda foto (opcional) | `IMG_2562.JPG` |
| `foto_3` | Tercera foto (opcional) | `IMG_2563.JPG` |
| `foto_4` | Cuarta foto (opcional) | `IMG_2564.JPG` |
| `foto_5` | Quinta foto (opcional) | `IMG_2565.JPG` |

**Límite**: Máximo 5 fotos por producto.

### Para Propiedades

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `foto_principal` | Foto principal de la propiedad (obligatoria si querés imágenes) | `depto1.jpg` |
| `foto_2` a `foto_10` | Fotos adicionales (opcionales) | `depto2.jpg`, `depto3.jpg`, etc. |

**Límite**: Máximo 10 fotos por propiedad.

## 📝 Nombres de Archivos

### Buenas Prácticas

✅ **Recomendado:**
- Nombres descriptivos: `departamento-2amb-centro.jpg`
- Con números: `casa1.jpg`, `casa2.jpg`
- Con identificadores: `PROP-001.jpg`, `PROD-ABC-123.jpg`
- Consistencia: Usar el mismo formato para todas las fotos

❌ **Evitar:**
- Nombres con espacios: `foto 1.jpg` (usar `foto1.jpg` o `foto_1.jpg`)
- Caracteres especiales: `foto@1.jpg`, `foto#1.jpg`
- Nombres muy largos: `esta-es-una-foto-muy-larga-con-muchos-detalies.jpg`

### Ejemplos de Nombres Correctos

```
✅ IMG_2561.JPG
✅ producto-001.jpg
✅ casa_centro_1.jpg
✅ depto2amb.jpg
✅ PROD-ABC-123.png
✅ propiedad1.webp
```

## 🌐 Usando URLs Completas

Si preferís no subir las fotos al servidor, podés usar URLs completas de imágenes alojadas en:

- Servidores propios
- Servicios de almacenamiento (S3, Cloudinary, etc.)
- Otros sitios web

**En el Excel, escribí la URL completa:**

```
foto_principal
https://mis-fotos.com/producto1.jpg
```

**Ventajas:**
- No ocupás espacio en el servidor
- Podés usar CDN para mayor velocidad
- Fácil de actualizar

**Desventajas:**
- Las fotos deben estar siempre accesibles
- Dependés de que el servidor externo esté disponible

## 💡 Ejemplos Prácticos

### Ejemplo 1: Producto con Fotos Locales

**Excel:**
```
titulo              | categoria | zona  | descripcion      | foto_principal  | foto_2          | foto_3
--------------------|-----------|-------|------------------|-----------------|-----------------|-----------------
Bicicleta Mountain  | Deportes  | Centro| Bicicleta nueva  | bike1.jpg       | bike2.jpg       | bike3.jpg
```

**Estructura de carpetas:**
```
public/uploads/
  ├── bike1.jpg
  ├── bike2.jpg
  └── bike3.jpg
```

**En el Excel escribís solo:** `bike1.jpg`, `bike2.jpg`, `bike3.jpg`

### Ejemplo 2: Propiedad con Fotos Locales

**Excel:**
```
titulo                    | tipo      | zona    | descripcion      | precio  | foto_principal | foto_2        | foto_3
--------------------------|-----------|---------|------------------|---------|----------------|---------------|---------------
Depto 2 amb en Centro     | alquiler  | Centro  | Hermoso depto... | 150000  | depto1.jpg     | depto2.jpg    | depto3.jpg
```

**Estructura de carpetas:**
```
public/uploads/
  ├── depto1.jpg
  ├── depto2.jpg
  └── depto3.jpg
```

### Ejemplo 3: Producto con URL Externa

**Excel:**
```
titulo              | categoria | zona  | descripcion      | foto_principal
--------------------|-----------|-------|------------------|--------------------------------------------------------
Bicicleta Mountain  | Deportes  | Centro| Bicicleta nueva  | https://mis-fotos.com/bicicletas/bike1.jpg
```

### Ejemplo 4: Mezcla de Fotos Locales y URLs

**Excel:**
```
titulo              | categoria | zona  | foto_principal                    | foto_2
--------------------|-----------|-------|-----------------------------------|---------------
Producto A          | Electronica| Centro| producto-a.jpg                  | https://cdn.ejemplo.com/foto2.jpg
Producto B          | Ropa      | Norte | https://servidor.com/foto1.jpg   | producto-b-2.jpg
```

## 🔧 Solución de Problemas

### ❌ Error: "Foto no encontrada"

**Problema:** El sistema no encuentra la foto especificada en el Excel.

**Soluciones:**
1. Verificá que el nombre del archivo en el Excel coincida exactamente con el nombre del archivo (incluyendo mayúsculas/minúsculas)
2. Asegurate de que el archivo esté en `public/uploads/`
3. Verificá que la extensión del archivo sea correcta (`.jpg`, `.jpeg`, `.png`, `.webp`)
4. Si usás URLs, verificá que la URL sea accesible públicamente

### ❌ Error: "Formato de imagen no válido"

**Problema:** El archivo no es una imagen válida.

**Soluciones:**
1. Verificá que el archivo sea realmente una imagen (no un documento disfrazado)
2. Convertí la imagen a un formato aceptado (JPG, PNG, WebP)
3. Abrí la imagen en un editor y guardala nuevamente

### ❌ Las fotos no se muestran después de importar

**Problema:** Las propiedades/productos se crearon pero las fotos no aparecen.

**Soluciones:**
1. Verificá que los archivos existan en `public/uploads/`
2. Verificá los permisos de los archivos (deben ser legibles)
3. Si usás URLs, verificá que las URLs sean accesibles desde internet
4. Revisá la consola del navegador para ver errores de carga

### ❌ Fotos muy grandes o muy pequeñas

**Problema:** Las fotos se ven pixeladas o tardan mucho en cargar.

**Soluciones:**

**Para fotos muy grandes:**
- Redimensioná las fotos a máximo 2000x2000 píxeles
- Comprimí las imágenes (podés usar herramientas online como TinyPNG)
- Convertí a formato WebP para mejor compresión

**Para fotos muy pequeñas:**
- Asegurate de que las fotos tengan al menos 800x600 píxeles
- Usá fotos de buena calidad original

### ❌ Muchas fotos para procesar

**Problema:** Tenés muchas fotos y querés organizarlas mejor.

**Soluciones:**
1. Creá subcarpetas dentro de `public/uploads/` por categoría:
   ```
   public/uploads/
     ├── productos/
     │   ├── electronica/
     │   └── ropa/
     └── propiedades/
         ├── casas/
         └── departamentos/
   ```
   
   **Nota:** Actualmente el sistema busca directamente en `public/uploads/`, así que si usás subcarpetas, debés incluir la ruta completa en el Excel (ej: `productos/electronica/producto1.jpg`)

2. O mantené todas las fotos en `public/uploads/` con nombres únicos (recomendado)

## 📋 Checklist Antes de Importar

Antes de importar tu Excel, verificá:

- [ ] Todas las fotos están en `public/uploads/` (o son URLs válidas)
- [ ] Los nombres de archivo coinciden exactamente con lo escrito en el Excel
- [ ] Las extensiones de archivo son correctas (.jpg, .jpeg, .png, .webp)
- [ ] Las fotos tienen un tamaño razonable (< 5 MB cada una)
- [ ] Las fotos tienen buena calidad (mínimo 800x600 píxeles)
- [ ] El número de fotos no excede el límite (5 para productos, 10 para propiedades)
- [ ] Si usás URLs, están accesibles públicamente

## 🚀 Herramientas Útiles

### Para Redimensionar Fotos

- **Online**: TinyPNG, Squoosh, ImageOptim
- **Desktop**: GIMP (gratis), Photoshop, Paint.NET (gratis)
- **Comando (ImageMagick)**: 
  ```bash
  convert imagen.jpg -resize 1200x1200 -quality 85 imagen-optimizada.jpg
  ```

### Para Renombrar Múltiples Archivos

- **Windows**: PowerToys Rename, Advanced Renamer
- **Mac**: Rename (app), Automator
- **Linux**: `rename` command, `mmv`

### Para Comprimir Fotos

- **Online**: TinyPNG, Compressor.io
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows)

## 📞 ¿Necesitás Ayuda?

Si tenés problemas con la importación de fotos:

1. Revisá esta guía completa
2. Verificá que seguiste todos los pasos del checklist
3. Revisá los errores en la página de importación (se muestran después de intentar importar)
4. Verificá la consola del navegador para errores adicionales

---

**Última actualización:** 2024
