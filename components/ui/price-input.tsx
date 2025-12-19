// Componente de input para precio con formato automático
'use client'

import { Input } from './input'
import { forwardRef } from 'react'

interface PriceInputProps extends React.ComponentProps<'input'> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const formatPrice = (val: string): string => {
      // Remover todo excepto números y punto decimal
      let cleaned = val.replace(/[^\d.]/g, '')
      
      // Solo permitir un punto decimal
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // Limitar a 2 decimales
      if (parts.length === 2 && parts[1].length > 2) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 2)
      }
      
      return cleaned
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPrice(e.target.value)
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value ? formatPrice(value) : ''}
        onChange={handleChange}
        placeholder="0.00"
        {...props}
      />
    )
  }
)

PriceInput.displayName = 'PriceInput'

