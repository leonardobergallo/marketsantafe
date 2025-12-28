// Componente de imagen segura con fallback
'use client'

import { useState, useEffect } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder.jpg'
}: SafeImageProps) {
  // Limpiar y normalizar la ruta de la imagen
  const normalizeSrc = (url: string) => {
    if (!url) return fallback
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Si la ruta empieza con /images/ o /uploads/images/, usar la API route
    // La API route manejará la decodificación de caracteres especiales
    if (url.startsWith('/images/')) {
      const imageName = url.replace('/images/', '')
      return `/api/images/${imageName}`
    }
    
    if (url.startsWith('/uploads/images/')) {
      const imageName = url.replace('/uploads/images/', '')
      return `/api/images/${imageName}`
    }
    
    // También manejar /uploads/ sin /images/
    if (url.startsWith('/uploads/') && !url.startsWith('/uploads/images/')) {
      const imageName = url.replace('/uploads/', '')
      return `/api/images/${imageName}`
    }
    
    // Para otras rutas, usar tal cual
    return url.startsWith('/') ? url : `/${url}`
  }

  // Siempre normalizar el src - no usar estado para la normalización
  const normalizedSrc = normalizeSrc(src || fallback)
  const [hasError, setHasError] = useState(false)

  const finalSrc = hasError ? fallback : normalizedSrc

  // Resetear error si cambia el src
  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        if (!hasError && finalSrc !== fallback) {
          console.warn('Error cargando imagen:', finalSrc, '→ Intentando fallback')
          setHasError(true)
        }
      }}
      onLoad={() => {
        // Imagen cargada correctamente
        if (hasError) {
          setHasError(false)
        }
      }}
      loading="lazy"
      decoding="async"
    />
  )
}

