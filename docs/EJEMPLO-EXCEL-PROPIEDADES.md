# Ejemplo de Excel para Importar Propiedades

Esta guía explica cómo preparar un archivo Excel para importar múltiples propiedades a la vez.

## Columnas Requeridas

El Excel **debe** tener estas columnas en la primera fila (encabezados):

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `titulo` | Título de la propiedad | "Departamento 2 ambientes en Centro" |
| `tipo` | Tipo de operación (alquiler, venta, alquiler-temporal) | "alquiler" |
| `zona` | Nombre o ID de la zona | "Centro" o "1" |
| `descripcion` | Descripción detallada | "Amplio departamento en zona céntrica..." |
| `precio` | Precio numérico | "150000" |

## Columnas Opcionales

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `moneda` | ARS o USD (default: ARS) | "ARS" |
| `ambientes` | Cantidad de ambientes | "2" |
| `banos` o `bathrooms` | Cantidad de baños | "1" |
| `superficie` o `area_m2` | Superficie en m² | "65" |
| `direccion` o `address` | Dirección de la propiedad | "San Martín 1234" |
| `foto_principal` | Nombre del archivo de imagen | "IMG_2561.JPG" |
| `foto_2`, `foto_3`, etc. | Fotos adicionales (hasta 10) | "IMG_2562.JPG" |
| `whatsapp` | Número de WhatsApp | "3425123456" |
| `telefono` | Número de teléfono | "3425123456" |
| `email` | Email de contacto | "info@inmobiliaria.com" |
| `instagram` | Usuario de Instagram | "inmobiliaria" |
| `servicio_profesional` | Si, true o 1 para activar | "si" |

## Ejemplo de Excel

```
titulo                                    | tipo      | zona    | descripcion                          | precio   | moneda | ambientes | banos | superficie | direccion        | foto_principal
------------------------------------------|-----------|---------|--------------------------------------|----------|--------|-----------|-------|------------|------------------|----------------
Departamento 2 ambientes en Centro       | alquiler  | Centro  | Amplio departamento luminoso...      | 150000   | ARS    | 2         | 1     | 65         | San Martín 1234  | depto1.jpg
Casa 3 ambientes en Barrio Norte         | venta     | 2       | Hermosa casa con jardín...           | 95000    | USD    | 3         | 2     | 120        | Belgrano 567     | casa1.jpg
Local comercial en San Martín            | alquiler  | San Martín | Local comercial en planta baja... | 80000    | ARS    | 1         | 1     | 45         | Corrientes 890   | local1.jpg
```

## Notas Importantes

1. **Tipo**: Debe ser exactamente uno de estos valores:
   - `alquiler`
   - `venta`
   - `alquiler-temporal`

2. **Zona**: Puedes usar:
   - El nombre de la zona: "Centro", "Barrio Norte", etc.
   - El ID numérico: "1", "2", "3", etc.
   - El slug: "centro", "barrio-norte", etc.

3. **Fotos**: 
   - Escribe solo el nombre del archivo (ej: `IMG_2561.JPG`)
   - Las imágenes deben estar en la carpeta `public/uploads/`
   - También puedes usar URLs completas: `https://ejemplo.com/imagen.jpg`

4. **Precio**: 
   - Solo números, sin símbolos de moneda
   - Puedes usar punto o coma para decimales

5. **Servicio Profesional**: 
   - Usa "si", "true" o "1" para activar
   - Cualquier otro valor o campo vacío = no activado

## Formato del Archivo

- Extensiones aceptadas: `.xlsx`, `.xls`, `.csv`
- Máximo 50 propiedades por archivo
- La primera fila debe contener los encabezados (nombres de columnas)
- Los encabezados no distinguen mayúsculas/minúsculas

## Ejemplo Completo con Todas las Columnas

```
titulo                    | tipo       | zona    | descripcion              | precio  | moneda | ambientes | banos | superficie | direccion       | foto_principal | foto_2        | whatsapp     | email                | servicio_profesional
--------------------------|------------|---------|--------------------------|---------|--------|-----------|-------|------------|-----------------|----------------|---------------|--------------|----------------------|-------------------
Depto 2 amb Centro        | alquiler   | Centro  | Hermoso depto...         | 150000  | ARS    | 2         | 1     | 65         | San Martín 1234 | depto1.jpg     | depto2.jpg    | 3425123456   | info@inmo.com        | si
Casa 3 amb Barrio Norte   | venta      | 2       | Casa con jardín...       | 95000   | USD    | 3         | 2     | 120        | Belgrano 567    | casa1.jpg      | casa2.jpg     | 3425123457   | ventas@inmo.com      | 
```

## Errores Comunes

1. **"Faltan columnas requeridas"**: Asegúrate de que los encabezados tengan exactamente estos nombres: `titulo`, `tipo`, `zona`, `descripcion`, `precio`

2. **"Tipo inválido"**: El tipo debe ser exactamente: `alquiler`, `venta` o `alquiler-temporal`

3. **"Zona no encontrada"**: Verifica que el nombre de la zona sea correcto. Puedes ver las zonas disponibles en el formulario de publicación.

4. **"El precio debe ser mayor a 0"**: El precio es obligatorio y debe ser un número válido mayor a cero.

