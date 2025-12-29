// Componente para subir imágenes
'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string[]
  onChange?: (images: string[]) => void
  maxImages?: number // Recomendado: 3, Máximo: 5
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 3, // Cambiado a 3 por defecto (recomendado)
  disabled = false,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newImages: string[] = []
    const remainingSlots = maxImages - images.length

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            newImages.push(result)
            
            if (newImages.length === Math.min(files.length, remainingSlots)) {
              const updatedImages = [...images, ...newImages]
              setImages(updatedImages)
              onChange?.(updatedImages)
            }
          }
          reader.readAsDataURL(file)
        }
      })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onChange?.(updatedImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || images.length >= maxImages}
        />

        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Arrastrá imágenes aquí o hacé clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Recomendado: {maxImages} imágenes (máximo 5). Formatos: JPG, PNG, etc.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || images.length >= maxImages}
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar imágenes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border">
                    <img
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            {images.length < maxImages && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Agregar más imágenes ({images.length}/{maxImages})
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

