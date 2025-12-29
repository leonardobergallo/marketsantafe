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
    
    // Si la URL tiene /uploads/images/, cambiarla a /uploads/
    if (normalized.startsWith('/uploads/images/')) {
      normalized = normalized.replace('/uploads/images/', '/uploads/')
    }
    
    // Asegurar que empiece con /
    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`
    }
    
    // Si la URL tiene caracteres especiales que podrían causar problemas,
    // usar la API route para servir la imagen
    // Next.js servirá archivos estáticos desde public/ automáticamente
    // pero para caracteres especiales, usar la API route
    const hasSpecialChars = /[()\[\]{}%#&?]/.test(normalized)
    
    if (hasSpecialChars && normalized.startsWith('/uploads/')) {
      // Usar API route para imágenes con caracteres especiales
      const imagePath = normalized.replace('/uploads/', '')
      return `/api/images/${encodeURIComponent(imagePath)}`
    }
    
    return normalized
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

