# Checklist de Testing - Importación Masiva V2

## ✅ Pre-requisitos

- [ ] Carpeta `/public/uploads/` existe
- [ ] Tienes imágenes de prueba en `/public/uploads/`
- [ ] Tienes un Excel de prueba con el formato correcto
- [ ] Estás autenticado en la aplicación

## 🧪 Tests de Validación

### Test 1: Validación de Columnas Obligatorias
- [ ] Excel sin `titulo` → Muestra error
- [ ] Excel sin `categoria` → Muestra error
- [ ] Excel sin `zona` → Muestra error
- [ ] Excel sin `descripcion` → Muestra error
- [ ] Excel sin `foto_principal` → Muestra error

### Test 2: Validación de Datos
- [ ] `titulo` con menos de 5 caracteres → Muestra error
- [ ] `descripcion` con menos de 10 caracteres → Muestra error
- [ ] `categoria` inválida → Muestra error con lista de categorías válidas
- [ ] `zona` inválida → Muestra error con lista de zonas válidas
- [ ] `precio` no numérico → Muestra error
- [ ] `moneda` diferente de ARS/USD → Muestra error
- [ ] `condicion` diferente de Nuevo/Usado → Muestra error
- [ ] `whatsapp` sin formato URL → Muestra error

### Test 3: Validación de Imágenes
- [ ] `foto_principal` con nombre que no existe → Muestra warning (no bloquea)
- [ ] `foto_2` con nombre que no existe → Muestra warning (no bloquea)
- [ ] `foto_principal` con nombre correcto → Imagen se muestra en preview
- [ ] Múltiples imágenes válidas → Todas se muestran en preview

## 🎯 Tests de Funcionalidad

### Test 4: Preview
- [ ] Subir Excel válido → Muestra preview con productos
- [ ] Preview muestra imagen principal correctamente
- [ ] Preview muestra warnings de imágenes no encontradas
- [ ] Preview muestra errores de validación
- [ ] Preview muestra contador de válidos/errores/total

### Test 5: Importación
- [ ] Confirmar importación → Productos se crean en la base de datos
- [ ] URLs de imágenes son correctas (`/uploads/nombre_archivo.jpg`)
- [ ] `image_url` contiene la primera imagen
- [ ] `images` (JSONB) contiene todas las imágenes
- [ ] Productos con errores no se importan
- [ ] Productos válidos se importan correctamente

### Test 6: Casos Especiales
- [ ] Excel con 50 productos → Se procesa correctamente
- [ ] Excel con más de 50 productos → Muestra error de límite
- [ ] Excel vacío → Muestra error
- [ ] Excel con formato incorrecto → Muestra error
- [ ] Producto sin precio → Se crea con precio 0
- [ ] Producto sin condición → Se crea sin condición
- [ ] Contactos por defecto se aplican correctamente

## 🔍 Tests de Integración

### Test 7: Base de Datos
- [ ] Productos importados aparecen en `/mercado`
- [ ] Imágenes se muestran correctamente en las tarjetas
- [ ] Imágenes se muestran correctamente en la página de detalle
- [ ] Datos del producto coinciden con el Excel

### Test 8: Edge Cases
- [ ] Nombres de archivo con espacios → Funciona correctamente
- [ ] Nombres de archivo con caracteres especiales → Funciona correctamente
- [ ] Nombres de archivo en mayúsculas/minúsculas → Funciona correctamente
- [ ] Excel con filas vacías → Se ignoran correctamente
- [ ] Excel con múltiples hojas → Usa la primera hoja

## 📊 Tests de Performance

### Test 9: Carga
- [ ] Excel con 10 productos → Se procesa en < 5 segundos
- [ ] Excel con 50 productos → Se procesa en < 30 segundos
- [ ] Preview se muestra sin lag
- [ ] Imágenes se cargan correctamente en el preview

## 🐛 Tests de Errores

### Test 10: Manejo de Errores
- [ ] Error de red → Muestra mensaje claro
- [ ] Error del servidor → Muestra mensaje claro
- [ ] Error de autenticación → Redirige a login
- [ ] Error de validación → Muestra detalles específicos
- [ ] Error de inserción → Muestra qué productos fallaron

## ✅ Criterios de Aceptación

- [ ] Todos los tests pasan
- [ ] No hay errores en la consola
- [ ] La UI es responsive y funciona en móvil
- [ ] Los mensajes de error son claros y útiles
- [ ] El proceso es intuitivo para el usuario



