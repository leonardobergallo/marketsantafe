# Guía de Importación desde Excel

## Columnas Requeridas del Excel

Tu archivo Excel debe tener las siguientes columnas en la primera fila (encabezados):

### Columnas Obligatorias

| Columna | Descripción | Ejemplo | Notas |
|---------|-------------|---------|-------|
| **titulo** | Título del producto | "iPhone 13 Pro Max 256GB" | Mínimo 5 caracteres |
| **categoria** | Nombre de la categoría | "Tecnología" | Ver categorías disponibles abajo |
| **zona** | Nombre de la zona/barrio | "Centro" | Ver zonas disponibles abajo |
| **descripcion** | Descripción del producto | "iPhone en excelente estado..." | Mínimo 10 caracteres |

### Columnas Opcionales

| Columna | Descripción | Ejemplo | Notas |
|---------|-------------|---------|-------|
| **precio** | Precio del producto | "450000" o "450000.50" | Número sin símbolos |
| **moneda** | Moneda del precio | "ARS" o "USD" | Por defecto: ARS |
| **condicion** | Condición del producto | "nuevo", "usado", "reacondicionado" | Opcional |
| **whatsapp** | Número de WhatsApp | "3425-123456" | Formato: 3425-123456 |
| **telefono** | Número de teléfono | "3425-123456" | Formato: 3425-123456 |
| **email** | Email de contacto | "contacto@ejemplo.com" | Debe ser un email válido |
| **instagram** | Usuario de Instagram | "@usuario" o "usuario" | Con o sin @ |
| **imagen1** | URL o base64 de imagen 1 | URL o base64 | Máximo 5 imágenes |
| **imagen2** | URL o base64 de imagen 2 | URL o base64 | Máximo 5 imágenes |
| **imagen3** | URL o base64 de imagen 3 | URL o base64 | Máximo 5 imágenes |
| **imagen4** | URL o base64 de imagen 4 | URL o base64 | Máximo 5 imágenes |
| **imagen5** | URL o base64 de imagen 5 | URL o base64 | Máximo 5 imágenes |

## Categorías Disponibles

Usa exactamente estos nombres en la columna "categoria":

1. **Alquileres**
2. **Inmuebles**
3. **Vehículos**
4. **Tecnología**
5. **Hogar y Muebles**
6. **Servicios**
7. **Electrodomésticos**
8. **Ropa y Accesorios**
9. **Deportes**
10. **Mascotas**

## Zonas Disponibles

Usa exactamente estos nombres en la columna "zona":

1. **Centro**
2. **Barrio Sur**
3. **Barrio Norte**
4. **San Martín**
5. **Villa María Selva**
6. **Barranquitas**
7. **San Agustín**
8. **Candioti**
9. **7 Jefes**
10. **Alto Verde**
11. **Toda la ciudad**

## Ejemplo de Excel

| titulo | categoria | zona | descripcion | precio | moneda | condicion | whatsapp | email |
|--------|-----------|------|-------------|--------|--------|-----------|----------|-------|
| iPhone 13 Pro Max | Tecnología | Centro | iPhone en excelente estado, con caja original | 450000 | ARS | usado | 3425-123456 | ventas@ejemplo.com |
| Departamento 2 ambientes | Alquileres | Barrio Sur | Hermoso departamento completamente amueblado | 85000 | ARS | nuevo | 3425-789012 | alquileres@ejemplo.com |

## Notas Importantes

1. **Formato del archivo**: Excel (.xlsx) o CSV (.csv)
2. **Primera fila**: Debe contener los encabezados de las columnas
3. **Imágenes**: Puedes usar URLs o base64. Si usas base64, debe comenzar con `data:image/...`
4. **Contacto compartido**: Si no especificas contacto en el Excel, puedes completarlo en el formulario web
5. **Límite**: Máximo 50 productos por importación

## Plantilla de Ejemplo

Puedes descargar una plantilla de ejemplo desde la página de carga masiva.


