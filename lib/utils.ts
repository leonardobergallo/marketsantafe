import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Helper para combinar clases de Tailwind (similar a classNames en React)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea un precio en pesos argentinos (ARS)
// TypeScript: recibe un número y devuelve un string formateado
// En JavaScript esto sería: export function formatPrice(price: number) { ... }
export function formatPrice(price: number): string {
  // Formatea el número con separadores de miles (punto) y decimales (coma)
  // Ejemplo: 120000 -> "120.000"
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Normaliza un string para búsquedas (elimina acentos, convierte a minúsculas)
// TypeScript: recibe string y devuelve string
// En JavaScript: export function normalizeString(str) { ... }
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (acentos)
    .trim()
}

// Helper para buscar texto normalizado en un string
// Útil para búsquedas que ignoran acentos y mayúsculas
export function searchInString(text: string, searchTerm: string): boolean {
  return normalizeString(text).includes(normalizeString(searchTerm))
}

// Generar slug desde un texto (business_name, etc.)
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
