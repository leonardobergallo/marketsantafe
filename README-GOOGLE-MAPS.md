# Configuración de Google Maps

## Pasos para configurar el mapa

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Maps JavaScript API**
4. Ve a "Credenciales" y crea una nueva API Key
5. Restringe la API Key (recomendado) para tu dominio

### 2. Agregar API Key al proyecto

Agrega la siguiente variable a tu archivo `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 3. Uso del componente

El componente `RestaurantMap` se usa automáticamente en la página `/comer` y muestra todos los restaurantes con sus ubicaciones.

### 4. Características del mapa

- ✅ Muestra marcadores para cada restaurante
- ✅ Info windows con información del local
- ✅ Ajusta el zoom automáticamente para mostrar todos los restaurantes
- ✅ Estilo minimalista
- ✅ Responsive

### 5. Costos

Google Maps tiene un tier gratuito generoso:
- **$200 USD de crédito mensual gratuito**
- Equivale a aproximadamente 28,000 cargas de mapas por mes
- Más que suficiente para un proyecto local

### Nota de seguridad

⚠️ **IMPORTANTE**: Nunca commitees tu API Key al repositorio. El archivo `.env.local` ya está en `.gitignore`.













