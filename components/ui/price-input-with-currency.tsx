// Componente de input para precio con selector de moneda
'use client'

import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { forwardRef, useState } from 'react'

interface PriceInputWithCurrencyProps {
  value?: string | number
  currency?: 'ARS' | 'USD'
  onPriceChange?: (price: string) => void
  onCurrencyChange?: (currency: 'ARS' | 'USD') => void
  onChange?: (price: string, currency: 'ARS' | 'USD') => void // Para compatibilidad
  disabled?: boolean
  className?: string
}

export function PriceInputWithCurrency({
  value = '',
  currency = 'ARS',
  onPriceChange,
  onCurrencyChange,
  onChange,
  disabled = false,
  className = '',
}: PriceInputWithCurrencyProps) {
  const formatPrice = (val: string | number | undefined): string => {
    if (!val && val !== 0) return ''
    // Convertir a string si es número
    const valStr = typeof val === 'number' ? val.toString() : String(val || '')
    // Remover todo excepto números y punto decimal
    let cleaned = valStr.replace(/[^\d.]/g, '')
    
    // Solo permitir un punto decimal
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2)
    }
    
    // Limitar parte entera a 12 dígitos
    if (parts.length > 0 && parts[0].length > 12) {
      cleaned = parts[0].slice(0, 12) + (parts.length > 1 ? '.' + (parts[1] || '').slice(0, 2) : '')
    }
    
    return cleaned
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    onPriceChange?.(formatted)
    onChange?.(formatted, currency) // Para compatibilidad
  }

  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyTyped = newCurrency as 'ARS' | 'USD'
    onCurrencyChange?.(newCurrencyTyped)
    onChange?.(formatPrice(value), newCurrencyTyped) // Para compatibilidad
  }

  const currencySymbol = currency === 'USD' ? 'U$S' : '$'
  const paddingLeft = currency === 'USD' ? 'pl-12' : 'pl-8'

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium z-10 ${currency === 'USD' ? 'min-w-[2.5rem]' : ''}`}>
            {currencySymbol}
          </span>
          <Input
            type="text"
            inputMode="decimal"
            value={formatPrice(value)}
            onChange={handlePriceChange}
            placeholder="0.00"
            disabled={disabled}
            className={paddingLeft}
          />
        </div>
        <Select
          value={currency}
          onValueChange={handleCurrencyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ARS">ARS</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

