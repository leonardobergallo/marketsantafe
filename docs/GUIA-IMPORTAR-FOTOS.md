# 📸 Guía: Cómo Agregar Fotos a tus Productos en Excel

Esta guía te explica cómo agregar fotos a tus productos cuando los importas desde Excel a MarketSantaFe.

---

## 🎯 Opciones para Agregar Fotos

Tienes **3 opciones** para agregar fotos a tus productos:

---

## Opción 1: Usar fotos en `public/uploads/` (Recomendado)

Si tus fotos están en la carpeta `public/uploads/`, puedes usarlas directamente.

### Pasos:

1. **Copia tus fotos** a la carpeta `public/uploads/`
   - Ejemplo: `public/uploads/IMG_2561.JPG`

2. **En el Excel**, escribe solo el **nombre del archivo** (sin la ruta)
   - Ejemplo: Si la foto es `public/uploads/iphone13.jpg`, escribe: `iphone13.jpg`

3. **El sistema automáticamente** buscará la foto en `public/uploads/`

---

## Opción 2: Usar fotos existentes en `public/images/`

Si tus fotos ya están en `public/images/`, puedes usarlas directamente.

### Pasos:

1. Busca el nombre del archivo en `public/images/`

2. En el Excel, escribe solo el **nombre del archivo**
   - Ejemplo: Si la foto es `public/images/iphone13.jpg`, escribe: `iphone13.jpg`

---

## Opción 3: URLs completas (Internet)

Si las fotos están en internet (Google Drive, Dropbox, etc.), usa la URL completa.

### Pasos:

1. Sube la foto a un servicio de almacenamiento (Google Drive, Dropbox, Imgur, etc.)

2. Obtén el enlace directo a la imagen

3. En el Excel, escribe la **URL completa**
   - Ejemplo: `https://drive.google.com/uc?id=123456789`
   - Ejemplo: `https://i.imgur.com/abc123.jpg`

⚠️ **Importante:** Asegúrate de que la URL sea un enlace directo a la imagen (que termine en .jpg, .png, etc.)

---

## 📋 Formato en el Excel

En el Excel, tienes **4 columnas** para fotos:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `foto_principal` | Foto principal del producto (**OBLIGATORIA**) | `IMG_2561.JPG` |
| `foto_2` | Segunda foto (opcional) | `iphone-lateral.jpg` |
| `foto_3` | Tercera foto (opcional) | `iphone-caja.jpg` |
| `foto_4` | Cuarta foto (opcional) | `iphone-accesorios.jpg` |

---

## 🔍 Ejemplo completo en el Excel

```
titulo: iPhone 13 Pro Max 256GB
foto_principal: IMG_2561.JPG
foto_2: WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg
foto_3: iphone-caja.jpg
foto_4: 
```

---

## ✅ Checklist antes de importar a MarketSantaFe

- [ ] Todas las fotos están en `public/uploads/` o tienen URLs válidas
- [ ] Los nombres de archivo en el Excel coinciden exactamente con los archivos
- [ ] La foto principal está completa (no puede estar vacía)
- [ ] Las fotos adicionales (foto_2, foto_3, foto_4) son opcionales pero recomendadas
- [ ] Si usas URLs, verifica que los enlaces funcionen

---

## 🚀 Proceso rápido

1. **Copia tus fotos** a `public/uploads/`
2. **Abre el Excel** `productos-exportados.xlsx`
3. **Escribe el nombre del archivo** en la columna `foto_principal`
4. **Agrega fotos adicionales** en `foto_2`, `foto_3`, `foto_4` si las tienes
5. **Guarda el Excel**
6. **Importa a MarketSantaFe**

---

## 💡 Tips

### Nombres de archivo
- ✅ **Bueno:** `iphone-13-pro-max.jpg`
- ❌ **Malo:** `foto del iphone 13.jpg`

Usa nombres descriptivos sin espacios (usa guiones o guiones bajos)

### Formatos soportados
- JPG, JPEG, PNG, GIF, WebP

### Tamaño recomendado
- Entre 500KB y 2MB por foto

### Dimensiones recomendadas
- 800x600px o 1200x900px

---

## ❓ Preguntas frecuentes

### P: ¿Puedo dejar foto_2, foto_3, foto_4 vacías?
**R:** Sí, son opcionales. Solo la `foto_principal` es obligatoria.

### P: ¿Qué pasa si el nombre del archivo no coincide?
**R:** La foto no se mostrará. Asegúrate de que el nombre sea exacto (incluyendo mayúsculas/minúsculas).

### P: ¿Puedo usar fotos de diferentes carpetas?
**R:** Sí, pero es mejor tenerlas todas en la misma carpeta (`public/uploads/`) para organizarlas mejor.

### P: ¿Las fotos se suben automáticamente a MarketSantaFe?
**R:** No, MarketSantaFe necesita que las fotos estén accesibles vía URL. Si usas carpetas locales (`public/uploads/`), las fotos se servirán desde el servidor. Si usas URLs externas, deben ser enlaces directos a las imágenes.

---

## 📁 Estructura de Carpetas Recomendada

```
public/
├── uploads/              ← Coloca aquí tus fotos de productos
│   ├── IMG_2561.JPG
│   ├── iphone13.jpg
│   └── ...
└── images/               ← Imágenes del sitio (logos, banners, etc.)
```

---

## 🔗 Verificación de URLs

Si usas URLs externas, verifica que funcionen:

1. Abre la URL en tu navegador
2. Debe mostrar directamente la imagen (no una página de descarga)
3. La URL debe terminar en una extensión de imagen (.jpg, .png, .gif, .webp)

**Ejemplos de URLs válidas:**
- ✅ `https://i.imgur.com/abc123.jpg`
- ✅ `https://drive.google.com/uc?id=123456789&export=download`
- ❌ `https://drive.google.com/file/d/123456789/view` (no es enlace directo)

---

## 🆘 Solución de Problemas

### La foto no se muestra después de importar

1. **Verifica el nombre del archivo:**
   - Debe coincidir exactamente (mayúsculas/minúsculas importan)
   - Ejemplo: `IMG_2561.JPG` ≠ `img_2561.jpg`

2. **Verifica la ubicación:**
   - Si usas `public/uploads/`, asegúrate de que el archivo esté ahí
   - Si usas URL, verifica que el enlace funcione

3. **Verifica el formato:**
   - Solo se aceptan: JPG, JPEG, PNG, GIF, WebP

### Error al importar el Excel

1. Verifica que la columna `foto_principal` tenga un valor
2. Verifica que el formato del Excel sea correcto
3. Revisa los logs del servidor para más detalles

---

## 📞 Soporte

Si tienes problemas, verifica:
- Los nombres de archivo en el Excel
- La ubicación de las fotos
- El formato de las URLs (si usas URLs externas)

---

**Última actualización:** Diciembre 2025


