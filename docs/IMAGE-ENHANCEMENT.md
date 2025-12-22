# Mejora de Imágenes con IA

## 🎨 Funcionalidad

El sistema incluye una funcionalidad de mejora de imágenes usando inteligencia artificial que permite:

- **Eliminar objetos no deseados** de las fotos (como un perro sobre un sillón)
- **Eliminar personas** de las imágenes
- **Limpiar fondos** y mejorar la calidad general

## 🔧 Configuración - Opciones GRATUITAS

### Opción 1: Remove.bg (RECOMENDADO - Más generoso)

1. Ve a [https://www.remove.bg/api](https://www.remove.bg/api)
2. Crea una cuenta gratuita
3. Obtén tu API key desde el dashboard
4. **Plan gratuito**: 50 imágenes/mes gratis

Agrega a tu `.env`:
```env
REMOVEBG_API_KEY=tu_api_key_aqui
```

### Opción 2: Clipdrop (Alternativa)

1. Ve a [https://clipdrop.co/api](https://clipdrop.co/api)
2. Crea una cuenta gratuita
3. Obtén tu API key desde el dashboard
4. **Plan gratuito**: 100 requests/mes gratis

Agrega a tu `.env`:
```env
CLIPDROP_API_KEY=tu_api_key_aqui
```

**Nota**: El sistema usa Remove.bg primero, y si no está disponible, usa Clipdrop automáticamente.

### 3. En Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega `REMOVEBG_API_KEY` o `CLIPDROP_API_KEY` con tu API key
4. Redeploya la aplicación

## 📱 Cómo Usar

1. **Sube una imagen** en el formulario de publicación
2. **Pasa el mouse** sobre la imagen
3. **Haz clic en el botón de mejora** (ícono de ✨)
4. La imagen se procesará automáticamente
5. La imagen mejorada reemplazará la original

## ⚠️ Notas Importantes

- **Límites gratuitos**:
  - Remove.bg: 50 imágenes/mes
  - Clipdrop: 100 requests/mes
- **Tiempo de procesamiento**: 5-15 segundos dependiendo del tamaño
- **Calidad**: Los resultados dependen de la complejidad de la imagen
- **Formato**: Funciona mejor con imágenes JPG/PNG

## 💡 Recomendación

**Usa Remove.bg** porque:
- ✅ 50 imágenes/mes gratis (más que Clipdrop)
- ✅ Mejor para eliminar objetos/personas
- ✅ API más estable
- ✅ Resultados de mejor calidad

## 🔄 Cambiar de Servicio

El sistema automáticamente usa Remove.bg si está configurado, y si no, usa Clipdrop. Solo necesitas configurar una API key en tu `.env`.

