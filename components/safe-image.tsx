// Componente de imagen segura con fallback
'use client'

import { useState, useEffect, useMemo } from 'react'

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
  // Memoizar la normalización para evitar recálculos innecesarios
  const normalizedSrc = useMemo(() => {
    const url = src || fallback
    
    if (!url) return fallback
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // En producción, servir imágenes directamente como archivos estáticos
    // Solo usar API route si es necesario para caracteres especiales
    // Normalizar la URL para servir desde public/
    if (url.startsWith('/images/') || url.startsWith('/uploads/images/') || url.startsWith('/uploads/')) {
      // Si la URL ya tiene el formato correcto, usarla directamente
      // Next.js servirá archivos estáticos desde public/ automáticamente
      return url.startsWith('/') ? url : `/${url}`
    }
    
    // Para otras rutas, usar tal cual
    return url.startsWith('/') ? url : `/${url}`
  }, [src, fallback])

  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Resetear estados cuando cambia el src
  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const finalSrc = hasError ? fallback : normalizedSrc

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={(e) => {
          if (!hasError && finalSrc !== fallback) {
            console.warn('Error cargando imagen:', finalSrc, '→ Intentando fallback')
            setHasError(true)
            setIsLoading(false)
          }
        }}
        onLoad={() => {
          setIsLoading(false)
          if (hasError) {
            setHasError(false)
          }
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

