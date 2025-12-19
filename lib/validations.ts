// Helpers de validación reutilizables
import { z } from 'zod'

// Validación de email
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Email inválido')
  .toLowerCase()
  .trim()

// Validación de email opcional
export const optionalEmailSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val.trim() === '') return undefined
    return val.toLowerCase().trim()
  })
  .refine(
    (val) => {
      if (!val) return true
      return z.string().email().safeParse(val).success
    },
    {
      message: 'Email inválido',
    }
  )

// Validación de Instagram (formato: @usuario o usuario)
export const instagramSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val.trim() === '') return undefined
    // Remover @ si existe y espacios
    return val.replace(/^@/, '').trim()
  })
  .refine(
    (val) => {
      if (!val) return true
      // Instagram: solo letras, números, puntos y guiones bajos, 1-30 caracteres
      return /^[a-zA-Z0-9._]{1,30}$/.test(val)
    },
    {
      message: 'Usuario de Instagram inválido',
    }
  )

// Validación de teléfono argentino (formato: 3425123456 o 3425-123456)
export const phoneSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val.trim() === '') return undefined
    // Remover espacios, guiones y paréntesis
    return val.replace(/[\s\-\(\)]/g, '')
  })
  .refine(
    (val) => {
      if (!val) return true // Opcional
      // Validar formato argentino: 10 dígitos, puede empezar con 0 o código de área
      const phoneRegex = /^(\+?54)?(0?)(9?)(\d{2})(\d{6,8})$/
      return phoneRegex.test(val) || /^\d{10}$/.test(val)
    },
    {
      message: 'Teléfono inválido. Formato: 3425123456',
    }
  )

// Validación de WhatsApp (mismo formato que teléfono)
export const whatsappSchema = phoneSchema

// Validación de contraseña
export const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'La contraseña no puede tener más de 100 caracteres')
  .refine(
    (val) => {
      // Al menos una letra y un número
      return /[A-Za-z]/.test(val) && /[0-9]/.test(val)
    },
    {
      message: 'La contraseña debe contener al menos una letra y un número',
    }
  )

// Validación de nombre
export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(200, 'El nombre no puede tener más de 200 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener letras y espacios')

// Validación de precio
export const priceSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    if (!val || val.trim() === '') return undefined
    // Remover símbolos de moneda (U$S, $), espacios, comas y puntos extras
    let cleaned = val.replace(/[U$S$,\s]/g, '').trim()
    // Reemplazar comas por puntos para decimales
    cleaned = cleaned.replace(',', '.')
    // Remover puntos extras, solo dejar uno
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    const num = parseFloat(cleaned)
    return isNaN(num) || num < 0 ? undefined : num.toString()
  })
  .refine(
    (val) => {
      if (!val) return true // Opcional
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 999999999999 // Máximo 12 dígitos
    },
    {
      message: 'El precio debe ser un número válido mayor o igual a 0',
    }
  )

// Formatear teléfono para mostrar
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    // Formato: 3425-123456
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  return cleaned
}

// Formatear email para mostrar (en minúsculas)
export function formatEmail(email: string | null | undefined): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

