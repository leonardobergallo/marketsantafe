# Parámetros para Importación desde Excel

## 📋 Columnas del Excel

### ✅ Columnas OBLIGATORIAS

| Columna | Tipo | Ejemplo | Validación |
|---------|------|---------|------------|
| **titulo** | Texto | "iPhone 13 Pro Max 256GB" | Mínimo 5 caracteres |
| **categoria** | Texto | "Tecnología" | Ver lista de categorías válidas abajo |
| **zona** | Texto | "Centro" | Ver lista de zonas válidas abajo |
| **descripcion** | Texto | "iPhone en excelente estado..." | Mínimo 10 caracteres |

### 📝 Columnas OPCIONALES

| Columna | Tipo | Ejemplo | Notas |
|---------|------|---------|-------|
| **precio** | Número | "450000" o "450000.50" | Sin símbolos de moneda |
| **moneda** | Texto | "ARS" o "USD" | Por defecto: ARS |
| **condicion** | Texto | "nuevo", "usado", "reacondicionado" | Solo estos valores |
| **whatsapp** | Texto | "3425-123456" | Formato: 3425-123456 |
| **telefono** | Texto | "3425-123456" | Formato: 3425-123456 |
| **email** | Texto | "contacto@ejemplo.com" | Email válido |
| **instagram** | Texto | "@usuario" o "usuario" | Con o sin @ |
| **imagen1** | URL/Base64 | URL o base64 | Máximo 5 imágenes |
| **imagen2** | URL/Base64 | URL o base64 | Máximo 5 imágenes |
| **imagen3** | URL/Base64 | URL o base64 | Máximo 5 imágenes |
| **imagen4** | URL/Base64 | URL o base64 | Máximo 5 imágenes |
| **imagen5** | URL/Base64 | URL o base64 | Máximo 5 imágenes |

## 📂 Categorías Válidas

Usa **exactamente** estos nombres (sin comillas):

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

Usa **exactamente** estos nombres (sin comillas):

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

## 📊 Ejemplo de Excel

| titulo | categoria | zona | descripcion | precio | moneda | condicion | whatsapp | email |
|--------|-----------|------|-------------|--------|--------|-----------|----------|-------|
| iPhone 13 Pro Max | Tecnología | Centro | iPhone en excelente estado, con caja original | 450000 | ARS | usado | 3425-123456 | ventas@ejemplo.com |
| Departamento 2 ambientes | Alquileres | Barrio Sur | Hermoso departamento completamente amueblado | 85000 | ARS | nuevo | 3425-789012 | alquileres@ejemplo.com |
| Notebook Dell | Tecnología | Centro | Notebook Dell en buen estado | 250000 | ARS | usado | | |

## ⚠️ Notas Importantes

1. **Formato del archivo**: Excel (.xlsx, .xls) o CSV (.csv)
2. **Primera fila**: Debe contener los encabezados de las columnas
3. **Nombres de columnas**: Son case-insensitive (puedes usar mayúsculas o minúsculas)
4. **Imágenes**: Puedes usar URLs o base64. Si usas base64, debe comenzar con `data:image/...`
5. **Contacto compartido**: Si no especificas contacto en el Excel, puedes completarlo en el formulario web
6. **Límite**: Máximo 50 productos por importación
7. **Precio**: Si no especificas precio, se mostrará como "Consultar precio"

## 🔄 Valores de Condición

- `nuevo`
- `usado`
- `reacondicionado`

## 💱 Valores de Moneda

- `ARS` (pesos argentinos) - Por defecto
- `USD` (dólares)

## 📥 Descargar Plantilla

Puedes descargar una plantilla de ejemplo desde la página de carga masiva haciendo clic en el botón "Descargar plantilla".



