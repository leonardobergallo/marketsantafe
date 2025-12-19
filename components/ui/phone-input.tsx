// Componente de input para teléfono con formato automático
'use client'

import { Input } from './input'
import { forwardRef, useState, useEffect } from 'react'

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('')

    const formatPhone = (val: string): string => {
      // Remover todo excepto números
      const numbers = val.replace(/\D/g, '')
      
      // Limitar a 10 dígitos
      const limited = numbers.slice(0, 10)
      
      // Formatear: 3425-123456
      if (limited.length <= 4) {
        return limited
      }
      return `${limited.slice(0, 4)}-${limited.slice(4)}`
    }

    // Sincronizar el valor cuando cambia desde fuera
    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatPhone(value))
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatPhone(inputValue)
      
      setDisplayValue(formatted)
      
      if (onChange) {
        // Crear un nuevo evento con el valor formateado
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
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="3425-123456"
        maxLength={11} // 4-6 dígitos con guión
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

