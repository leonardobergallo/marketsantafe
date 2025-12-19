// Componente para mostrar galería de imágenes
'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { SafeImage } from './safe-image'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  maxPreview?: number // Máximo de imágenes a mostrar en preview (default: 3)
}

export function ImageGallery({ images, alt = 'Imagen', maxPreview = 3 }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Sin imágenes</p>
      </div>
    )
  }

  const displayImages = images.slice(0, maxPreview)
  const remainingCount = images.length - maxPreview

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  return (
    <>
      {/* Galería de preview */}
      <div className="grid grid-cols-3 gap-2">
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg cursor-pointer group',
              index === 0 && images.length > 1 && 'col-span-2 row-span-2'
            )}
            onClick={() => openLightbox(index)}
          >
            <SafeImage
              src={image}
              alt={`${alt} ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {index === 0 && images.length > 1 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">
                  {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
            )}
            {index === maxPreview - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-bold">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          <div className="max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={images[selectedIndex]}
              alt={`${alt} ${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

