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
    
    // Normalizar la URL para servir desde public/
    let normalized = url
    
    // Mantener las rutas como están (uploads/images/ o images/)
    // En producción, Next.js servirá archivos estáticos desde public/ automáticamente
    if (normalized.startsWith('/images/') && !normalized.startsWith('/uploads/')) {
      // Si está en /images/ pero debería estar en /uploads/images/, no cambiar
      // Solo asegurar que tenga el formato correcto
    }
    
    // Asegurar que empiece con /
    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`
    }
    
    // Servir directamente como archivo estático
    // Next.js servirá archivos estáticos desde public/ automáticamente
    return normalized
  }, [src, fallback])

  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Resetear estados cuando cambia el src
  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
  }, [normalizedSrc])

  const finalSrc = hasError ? fallback : normalizedSrc

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse z-0" />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 relative z-10`}
        onError={(e) => {
          if (!hasError && finalSrc !== fallback) {
            setHasError(true)
            setIsLoading(false)
          } else {
            setIsLoading(false)
          }
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

