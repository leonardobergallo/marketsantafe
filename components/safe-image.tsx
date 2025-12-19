// Componente de imagen segura con fallback
'use client'

import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export function SafeImage({ src, alt, className = '', fallback = '/placeholder.jpg' }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback)
        }
      }}
    />
  )
}

