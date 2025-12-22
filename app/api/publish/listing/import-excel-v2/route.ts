// API route para importar listings desde Excel con imágenes por nombre original
// POST /api/publish/listing/import-excel-v2
// 
// Formato esperado:
// - Columnas: titulo, categoria, zona, descripcion, precio, moneda, condicion, whatsapp
// - Imágenes: foto_principal (obligatoria), foto_2, foto_3, foto_4 (opcionales)
// - Las imágenes deben estar en /public/uploads/ con sus nombres originales

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import * as XLSX from 'xlsx'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { promises as fs } from 'fs'
import path from 'path'

// Función para obtener zonas desde la base de datos
async function getZonesFromDB() {
  try {
    const result = await pool.query('SELECT id, name, slug FROM zones ORDER BY name')
    const zoneMap = new Map<string, { id: string; name: string; slug: string }>()
    
    result.rows.forEach((row: any) => {
      const nameLower = row.name.toLowerCase().trim()
      const nameWithoutCommas = nameLower.replace(/,/g, '').replace(/\s+/g, ' ').trim()
      
      // Agregar con el nombre original (con comas si las tiene)
      zoneMap.set(nameLower, {
        id: row.id.toString(),
        name: row.name,
        slug: row.slug,
      })
      
      // También agregar sin comas para búsqueda flexible
      if (nameWithoutCommas !== nameLower) {
        zoneMap.set(nameWithoutCommas, {
          id: row.id.toString(),
          name: row.name,
          slug: row.slug,
        })
      }
    })
    
    return zoneMap
  } catch (error) {
    console.error('Error obteniendo zonas desde DB:', error)
    // Fallback a zonas estáticas
    const fallbackMap = new Map<string, { id: string; name: string; slug: string }>()
    zones.forEach((zone) => {
      const nameLower = zone.name.toLowerCase()
      const nameWithoutCommas = nameLower.replace(/,/g, '').replace(/\s+/g, ' ').trim()
      fallbackMap.set(nameLower, { id: zone.id, name: zone.name, slug: zone.slug })
      if (nameWithoutCommas !== nameLower) {
        fallbackMap.set(nameWithoutCommas, { id: zone.id, name: zone.name, slug: zone.slug })
      }
    })
    return fallbackMap
  }
}

// Función para obtener categorías desde la base de datos
async function getCategoriesFromDB() {
  try {
    const result = await pool.query('SELECT id, name, slug FROM categories ORDER BY name')
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>()
    
    result.rows.forEach((row: any) => {
      const nameLower = row.name.toLowerCase().trim()
      categoryMap.set(nameLower, {
        id: row.id.toString(),
        name: row.name,
        slug: row.slug,
      })
    })
    
    return categoryMap
  } catch (error) {
    console.error('Error obteniendo categorías desde DB:', error)
    // Fallback a categorías estáticas
    return new Map(
      categories.map((cat) => [cat.name.toLowerCase(), { id: cat.id, name: cat.name, slug: cat.slug }])
    )
  }
}

// Mapeo inteligente de categorías similares
const categoryAliases: Map<string, string> = new Map([
  // Hogar y Muebles
  ['jardín y herramientas', 'hogar y muebles'],
  ['jardin y herramientas', 'hogar y muebles'],
  ['herramientas', 'hogar y muebles'],
  ['jardín', 'hogar y muebles'],
  ['jardin', 'hogar y muebles'],
  ['hogar y oficina', 'hogar y muebles'],
  ['oficina', 'hogar y muebles'],
  ['muebles', 'hogar y muebles'],
  ['decoración', 'hogar y muebles'],
  ['decoracion', 'hogar y muebles'],
  // Tecnología
  ['consolas y videojuegos', 'tecnología'],
  ['consolas', 'tecnología'],
  ['videojuegos', 'tecnología'],
  ['video juegos', 'tecnología'],
  ['computadoras', 'tecnología'],
  ['celulares', 'tecnología'],
  ['smartphones', 'tecnología'],
  ['tablets', 'tecnología'],
  ['notebooks', 'tecnología'],
  ['laptops', 'tecnología'],
  // Inmuebles
  ['terreno', 'inmuebles'],
  ['terrenos', 'inmuebles'],
  ['lote', 'inmuebles'],
  ['lotes', 'inmuebles'],
  ['casa', 'inmuebles'],
  ['casas', 'inmuebles'],
  ['departamento', 'inmuebles'],
  ['departamentos', 'inmuebles'],
  ['depto', 'inmuebles'],
  ['local', 'inmuebles'],
  ['locales', 'inmuebles'],
  ['oficina comercial', 'inmuebles'],
  ['oficinas', 'inmuebles'],
  ['propiedad', 'inmuebles'],
  ['propiedades', 'inmuebles'],
  // Alquileres
  ['alquiler', 'alquileres'],
  ['alquiler temporal', 'alquileres'],
  ['alquiler permanente', 'alquileres'],
  // Vehículos
  ['auto', 'vehículos'],
  ['autos', 'vehículos'],
  ['vehiculo', 'vehículos'],
  ['moto', 'vehículos'],
  ['motocicleta', 'vehículos'],
  ['bicicleta', 'vehículos'],
  ['bici', 'vehículos'],
  // Servicios
  ['servicio', 'servicios'],
  ['trabajo', 'servicios'],
  ['empleo', 'servicios'],
  ['clases', 'servicios'],
  ['cursos', 'servicios'],
  ['tutoría', 'servicios'],
  ['tutoria', 'servicios'],
  // Deportes
  ['deporte', 'deportes'],
  ['fitness', 'deportes'],
  ['gimnasio', 'deportes'],
  ['ejercicio', 'deportes'],
  // Mascotas
  ['mascota', 'mascotas'],
  ['perro', 'mascotas'],
  ['gato', 'mascotas'],
  ['animal', 'mascotas'],
  ['animales', 'mascotas'],
  // Ropa y Accesorios
  ['ropa', 'ropa y accesorios'],
  ['vestimenta', 'ropa y accesorios'],
  ['accesorios', 'ropa y accesorios'],
  ['calzado', 'ropa y accesorios'],
  ['zapatos', 'ropa y accesorios'],
  // Electrodomésticos
  ['electrodomestico', 'electrodomésticos'],
  ['heladera', 'electrodomésticos'],
  ['lavarropas', 'electrodomésticos'],
  ['lavadora', 'electrodomésticos'],
  ['microondas', 'electrodomésticos'],
  ['horno', 'electrodomésticos'],
])

function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

function parseExcelFile(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })
  return data
}

// Normalizar nombre de archivo para búsqueda
function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

// Cache de archivos de imagen (se carga una vez)
let imageFilesCache: string[] | null = null
let imageFilesCacheTime: number = 0
const CACHE_DURATION = 60000 // 1 minuto

async function getImageFiles(): Promise<string[]> {
  const now = Date.now()
  if (imageFilesCache && (now - imageFilesCacheTime) < CACHE_DURATION) {
    return imageFilesCache
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const files = await fs.readdir(uploadsDir)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file))
    imageFilesCache = imageFiles
    imageFilesCacheTime = now
    return imageFiles
  } catch (error) {
    console.error('Error leyendo directorio de imágenes:', error)
    return []
  }
}

// Buscar imagen similar si no existe la exacta
async function findSimilarImage(filename: string): Promise<string | null> {
  try {
    const imageFiles = await getImageFiles()
    
    // 1. Buscar coincidencia exacta (case-insensitive)
    for (const file of imageFiles) {
      if (file.toLowerCase() === filename.toLowerCase()) {
        return file
      }
    }
    
    // 2. Buscar por nombre normalizado (sin extensión)
    const searchBase = path.basename(filename, path.extname(filename))
    const normalizedSearchBase = normalizeFileName(searchBase)
    
    for (const file of imageFiles) {
      const fileBase = path.basename(file, path.extname(file))
      const normalizedFileBase = normalizeFileName(fileBase)
      
      if (normalizedFileBase === normalizedSearchBase) {
        return file
      }
    }
    
    // 3. Buscar por palabras clave (extraer palabras significativas)
    function extractWords(text: string): string[] {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
    }
    
    const searchWords = extractWords(searchBase)
    
    if (searchWords.length > 0) {
      let bestMatch: { file: string; score: number } | null = null
      
      for (const file of imageFiles) {
        const fileBase = path.basename(file, path.extname(file))
        const fileWords = extractWords(fileBase)
        
        // Calcular coincidencias
        const matches = searchWords.filter(word => fileWords.includes(word))
        const score = matches.length / Math.max(searchWords.length, fileWords.length)
        
        // Si al menos 50% de las palabras coinciden
        if (score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { file, score }
        }
      }
      
      if (bestMatch) {
        return bestMatch.file
      }
    }
    
    // 4. Buscar por número (si el nombre tiene números)
    const numbersInSearch = filename.match(/\d+/g)
    if (numbersInSearch && numbersInSearch.length > 0) {
      for (const file of imageFiles) {
        const numbersInFile = file.match(/\d+/g)
        if (numbersInFile && numbersInFile.some(num => numbersInSearch.includes(num))) {
          return file
        }
      }
    }
    
    // 5. Buscar por similitud de caracteres (para nombres como "IMG_2561" vs "img2561")
    const searchChars = normalizedSearchBase.split('')
    for (const file of imageFiles) {
      const fileBase = path.basename(file, path.extname(file))
      const normalizedFile = normalizeFileName(fileBase)
      const fileChars = normalizedFile.split('')
      
      // Si tienen al menos 70% de caracteres en común
      const commonChars = searchChars.filter(char => fileChars.includes(char)).length
      const similarity = commonChars / Math.max(searchChars.length, fileChars.length)
      
      if (similarity >= 0.7) {
        return file
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error buscando imagen similar para "${filename}":`, error)
    return null
  }
}

// Verificar si una imagen existe en /public/uploads/ (exacta o similar)
async function checkImageExists(filename: string): Promise<{ exists: boolean; actualFilename?: string }> {
  try {
    // Primero verificar en el cache si existe exactamente
    const imageFiles = await getImageFiles()
    const exactMatch = imageFiles.find(file => file.toLowerCase() === filename.toLowerCase())
    if (exactMatch) {
      return { exists: true, actualFilename: exactMatch }
    }

    // Si no existe exacta, buscar similar
    const similar = await findSimilarImage(filename)
    if (similar) {
      return { exists: true, actualFilename: similar }
    }
    return { exists: false }
  } catch (error) {
    console.error(`Error verificando imagen "${filename}":`, error)
    return { exists: false }
  }
}

// Construir URL de imagen
function buildImageUrl(filename: string): string {
  return `/uploads/${filename}`
}

function validateAndTransformRow(
  row: any, 
  index: number,
  checkImages: boolean = false,
  zoneMap: Map<string, { id: string; name: string; slug: string }>,
  categoryMap: Map<string, { id: string; name: string; slug: string }>
): Promise<{ valid: boolean; data?: any; errors: string[]; warnings: string[] }> {
  return new Promise(async (resolve) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Campos obligatorios
    const title = row.titulo || row.title || ''
    const categoryName = row.categoria || row.category || ''
    const zoneName = row.zona || row.zone || ''
    const description = row.descripcion || row.description || ''
    const fotoPrincipal = row.foto_principal || row.fotoPrincipal || ''

    // Validaciones básicas
    if (!title || title.trim().length < 5) {
      errors.push('Título debe tener al menos 5 caracteres')
    }

    if (!categoryName) {
      errors.push('Categoría es requerida')
    } else {
      const normalizedCategoryName = normalizeString(categoryName)
      
      // Buscar categoría exacta
      let categoryData = categoryMap.get(normalizedCategoryName)
      
      // Si no se encuentra, buscar alias
      if (!categoryData) {
        const alias = categoryAliases.get(normalizedCategoryName)
        if (alias) {
          categoryData = categoryMap.get(alias)
          if (categoryData) {
            warnings.push(`Categoría "${categoryName}" mapeada a "${categoryData.name}"`)
          }
        }
      }
      
      // Si aún no se encuentra, buscar por palabras clave
      if (!categoryData) {
        const categoryWords = normalizedCategoryName.split(' ')
        for (const [key, value] of categoryMap.entries()) {
          const keyWords = key.split(' ')
          const matches = categoryWords.filter(word => keyWords.includes(word))
          if (matches.length >= Math.min(2, categoryWords.length)) {
            categoryData = value
            warnings.push(`Categoría "${categoryName}" mapeada a "${categoryData.name}"`)
            break
          }
        }
      }
      
      if (!categoryData) {
        // Obtener lista de categorías disponibles
        const availableCategories = Array.from(categoryMap.values()).map(c => c.name).join(', ')
        errors.push(`Categoría "${categoryName}" no es válida. Categorías disponibles: ${availableCategories}`)
      }
    }

    if (!zoneName) {
      errors.push('Zona es requerida')
    } else {
      // Normalizar nombre de zona (quitar comas, espacios extra, etc.)
      const normalizedZoneName = normalizeString(zoneName)
        .replace(/,/g, '') // Quitar comas
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim()
      
      // Buscar zona exacta (sin comas)
      let zoneData = zoneMap.get(normalizedZoneName)
      
      // Si no se encuentra, buscar con comas también
      if (!zoneData) {
        const withCommas = normalizeString(zoneName).trim()
        zoneData = zoneMap.get(withCommas)
      }
      
      // Si no se encuentra, intentar búsqueda parcial (por si dice "Santa Fe" y existe "Centro, Santa Fe" o "Colastiné, Santa Fe")
      if (!zoneData) {
        for (const [key, value] of zoneMap.entries()) {
          // Buscar si el nombre normalizado está contenido en la clave o viceversa
          const keyNormalized = key.replace(/,/g, '').replace(/\s+/g, ' ').trim()
          if (keyNormalized === normalizedZoneName || 
              keyNormalized.includes(normalizedZoneName) || 
              normalizedZoneName.includes(keyNormalized)) {
            zoneData = value
            warnings.push(`Zona "${zoneName}" mapeada a "${zoneData.name}"`)
            break
          }
        }
      }
      
      // Si aún no se encuentra, intentar buscar por palabras clave comunes
      if (!zoneData) {
        const zoneNameWords = normalizedZoneName.split(' ').filter(w => w.length > 2)
        for (const [key, value] of zoneMap.entries()) {
          const keyNormalized = key.replace(/,/g, '').replace(/\s+/g, ' ').trim()
          const keyWords = keyNormalized.split(' ').filter(w => w.length > 2)
          // Si al menos 1 palabra coincide (para casos como "Santa Fe")
          const matches = zoneNameWords.filter(word => keyWords.includes(word))
          if (matches.length >= Math.min(1, zoneNameWords.length)) {
            zoneData = value
            warnings.push(`Zona "${zoneName}" mapeada a "${zoneData.name}" por similitud`)
            break
          }
        }
      }
      
      if (!zoneData) {
        // Obtener lista de zonas disponibles para el mensaje de error
        const availableZones = Array.from(zoneMap.values()).map(z => z.name).join(', ')
        errors.push(`Zona "${zoneName}" no es válida. Zonas disponibles: ${availableZones}`)
      }
    }

    if (!description || description.trim().length < 10) {
      errors.push('Descripción debe tener al menos 10 caracteres')
    }

    // foto_principal es opcional (el usuario subirá las fotos manualmente)
    // No validar foto_principal

    // Validar precio (debe ser numérico)
    const price = row.precio || row.price
    if (price !== undefined && price !== null && price !== '') {
      const priceNum = parseFloat(String(price).replace(/[^\d.-]/g, ''))
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push('Precio debe ser un número válido')
      }
    }

    // Validar moneda (solo ARS o USD)
    const currency = row.moneda || row.currency || 'ARS'
    const currencyUpper = String(currency).toUpperCase()
    if (currencyUpper !== 'ARS' && currencyUpper !== 'USD') {
      errors.push('Moneda debe ser ARS o USD')
    }

    // Validar condición (Nuevo o Usado)
    const condition = row.condicion || row.condition || ''
    if (condition && condition.trim() !== '') {
      const conditionLower = normalizeString(condition)
      const validConditions = ['nuevo', 'usado']
      if (!validConditions.includes(conditionLower)) {
        errors.push('Condición debe ser "Nuevo" o "Usado"')
      }
    }

    // Validar WhatsApp (debe ser URL completa si está presente)
    const whatsapp = row.whatsapp || ''
    if (whatsapp && whatsapp.trim() !== '') {
      const whatsappUrl = whatsapp.trim()
      if (!whatsappUrl.startsWith('https://wa.me/') && !whatsappUrl.startsWith('http://wa.me/')) {
        errors.push('WhatsApp debe ser una URL completa (ej: https://wa.me/549XXXXXXXXXX)')
      }
    }

    if (errors.length > 0) {
      resolve({ valid: false, errors, warnings: [] })
      return
    }

    // Recopilar imágenes (opcional - el usuario subirá las fotos manualmente después)
    const imageFilenames: string[] = []
    
    // Foto principal (opcional)
    if (fotoPrincipal && fotoPrincipal.trim() !== '') {
      imageFilenames.push(fotoPrincipal.trim())
    }

    // Fotos opcionales (hasta foto_10)
    for (let i = 2; i <= 10; i++) {
      const foto = row[`foto_${i}`] || row[`foto${i}`]
      if (foto && foto.trim() !== '') {
        imageFilenames.push(foto.trim())
      }
    }

    // Si hay imágenes en el Excel, construir URLs (sin verificar existencia)
    // Si no hay imágenes, dejar vacío (el usuario las subirá manualmente)
    const finalImageFilenames: string[] = []
    
    if (imageFilenames.length > 0) {
      // Si se especificaron imágenes, construir URLs directamente sin verificar
      // (el usuario las subirá manualmente si no existen)
      finalImageFilenames.push(...imageFilenames)
    }
    // Si no hay imágenes, finalImageFilenames queda vacío (OK, se subirán manualmente)

    // Construir URLs de imágenes
    const imageUrls = finalImageFilenames.map(buildImageUrl)

    // Transformar datos - obtener categoryId
    const normalizedCategoryName = normalizeString(categoryName)
    let categoryData = categoryMap.get(normalizedCategoryName)
    
    if (!categoryData) {
      const alias = categoryAliases.get(normalizedCategoryName)
      if (alias) {
        categoryData = categoryMap.get(alias)
      }
    }
    
    if (!categoryData) {
      const categoryWords = normalizedCategoryName.split(' ')
      for (const [key, value] of categoryMap.entries()) {
        const keyWords = key.split(' ')
        const matches = categoryWords.filter(word => keyWords.includes(word))
        if (matches.length >= Math.min(2, categoryWords.length)) {
          categoryData = value
          break
        }
      }
    }
    
    const categoryId = categoryData?.id
    
    // Obtener zoneId (ya validado arriba)
    const normalizedZoneName = normalizeString(zoneName)
      .replace(/,/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    let zoneData = zoneMap.get(normalizedZoneName)
    if (!zoneData) {
      for (const [key, value] of zoneMap.entries()) {
        if (key.includes(normalizedZoneName) || normalizedZoneName.includes(key)) {
          zoneData = value
          break
        }
      }
    }
    if (!zoneData) {
      const zoneNameWords = normalizedZoneName.split(' ')
      for (const [key, value] of zoneMap.entries()) {
        const keyWords = key.split(' ')
        const matches = zoneNameWords.filter(word => keyWords.includes(word))
        if (matches.length >= Math.min(2, zoneNameWords.length)) {
          zoneData = value
          break
        }
      }
    }
    
    const zoneId = zoneData?.id

    const transformedData = {
      title: title.trim(),
      categoryId,
      zoneId,
      price: price !== undefined && price !== null && price !== '' 
        ? parseFloat(String(price).replace(/[^\d.-]/g, '')) 
        : 0,
      currency: currencyUpper,
      condition: condition && condition.trim() !== '' 
        ? normalizeString(condition) 
        : null,
      description: description.trim(),
      whatsapp: whatsapp && whatsapp.trim() !== '' ? whatsapp.trim() : undefined,
      phone: row.telefono || row.phone ? String(row.telefono || row.phone).trim() : undefined,
      email: row.email ? String(row.email).trim() : undefined,
      instagram: row.instagram ? String(row.instagram).trim().replace(/^@/, '') : undefined,
      images: imageUrls.length > 0 ? imageUrls : [], // Si no hay imágenes, array vacío (OK - se subirán manualmente)
      image_url: imageUrls[0] || null, // Si no hay imágenes, null (OK - se subirán manualmente)
    }

    resolve({ valid: true, data: transformedData, errors: [], warnings })
  })
}

// Endpoint para preview (solo validación, sin insertar)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para importar' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const previewOnly = formData.get('previewOnly') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Formato de archivo no válido. Usa Excel (.xlsx, .xls) o CSV (.csv)' },
        { status: 400 }
      )
    }

    // Leer archivo
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parsear Excel
    let rows: any[]
    try {
      rows = parseExcelFile(buffer)
    } catch (error) {
      console.error('Error al parsear Excel:', error)
      return NextResponse.json(
        { error: 'Error al leer el archivo Excel. Verifica que el formato sea correcto.' },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío' },
        { status: 400 }
      )
    }

    // Limitar a 50 productos
    if (rows.length > 50) {
      return NextResponse.json(
        { error: `Máximo 50 productos por importación. Tu archivo tiene ${rows.length} filas.` },
        { status: 400 }
      )
    }

    // Campos de contacto compartidos (opcionales)
    const defaultWhatsapp = formData.get('defaultWhatsapp')?.toString() || undefined
    const defaultPhone = formData.get('defaultPhone')?.toString() || undefined
    const defaultEmail = formData.get('defaultEmail')?.toString() || undefined
    const defaultInstagram = formData.get('defaultInstagram')?.toString() || undefined

    // Obtener zonas y categorías desde la base de datos
    const zoneMap = await getZonesFromDB()
    const categoryMap = await getCategoriesFromDB()

    // Precargar cache de imágenes (una sola vez, antes de procesar)
    console.log('📸 Precargando lista de imágenes...')
    await getImageFiles()
    console.log(`✅ ${imageFilesCache?.length || 0} imágenes encontradas`)

    // Validar y transformar cada fila
    const validListings: any[] = []
    const errors: { row: number; errors: string[]; warnings: string[] }[] = []

    console.log(`🔄 Procesando ${rows.length} productos...`)
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      if (index % 5 === 0 && index > 0) {
        console.log(`   Procesando producto ${index + 1}/${rows.length}...`)
      }
      // No verificar imágenes (checkImages = false) - el usuario las subirá manualmente
      const result = await validateAndTransformRow(row, index + 2, false, zoneMap, categoryMap) // +2 porque index es 0-based y la fila 1 es el header
      
      if (result.valid && result.data) {
        // Aplicar contactos por defecto si no están definidos
        const listing = {
          ...result.data,
          whatsapp: result.data.whatsapp || (defaultWhatsapp && defaultWhatsapp.trim() !== '' ? defaultWhatsapp : undefined),
          phone: result.data.phone || (defaultPhone && defaultPhone.trim() !== '' ? defaultPhone : undefined),
          email: result.data.email || (defaultEmail && defaultEmail.trim() !== '' ? defaultEmail : undefined),
          instagram: result.data.instagram || (defaultInstagram && defaultInstagram.trim() !== '' ? defaultInstagram : undefined),
          warnings: result.warnings,
        }
        validListings.push(listing)
      } else {
        errors.push({ 
          row: index + 2, 
          errors: result.errors,
          warnings: result.warnings || []
        })
      }
    }

    // Si es solo preview, retornar resultados sin insertar
    if (previewOnly) {
      return NextResponse.json({
        message: 'Preview generado exitosamente',
        preview: true,
        totalRows: rows.length,
        total: rows.length,
        validRows: validListings.length,
        valid: validListings.length,
        errorRows: errors.length,
        errors: errors.length,
        previewListings: validListings.map(l => ({
          title: l.title,
          description: l.description,
          categoryId: l.categoryId, // Incluir el ID
          category: categoryMap.get(normalizeString(l.categoryId || ''))?.name || 'N/A',
          zoneId: l.zoneId, // Incluir el ID
          zone: zoneMap.get(normalizeString(l.zoneId || ''))?.name || 'N/A',
          price: l.price,
          currency: l.currency,
          condition: l.condition,
          imageUrl: l.image_url || (l.images && l.images.length > 0 ? l.images[0] : null),
          images: l.images || (l.image_url ? [l.image_url] : []), // Todas las imágenes
          whatsapp: l.whatsapp,
          phone: l.phone,
          email: l.email,
          instagram: l.instagram,
          warnings: l.warnings || [],
        })),
        listings: validListings,
        errorsDetails: errors,
      })
    }

    if (validListings.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se encontraron productos válidos en el archivo',
          errors,
        },
        { status: 400 }
      )
    }

    // Insertar listings en la base de datos
    const results = []
    const insertErrors = []

    for (let i = 0; i < validListings.length; i++) {
      const listing = validListings[i]
      
      try {
        // Preparar imágenes (sin límite)
        const imagesArray = listing.images && listing.images.length > 0 
          ? listing.images.filter(img => img && img.trim() !== '')
          : []
        
        const primaryImage = imagesArray.length > 0 ? imagesArray[0] : null

        // Insertar listing
        const result = await pool.query(
          `INSERT INTO listings (user_id, category_id, zone_id, title, description, price, currency, condition, whatsapp, phone, email, instagram, image_url, images, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id, title, created_at`,
          [
            user.id,
            parseInt(listing.categoryId),
            parseInt(listing.zoneId),
            listing.title,
            listing.description,
            listing.price || 0,
            listing.currency || 'ARS',
            listing.condition || null,
            listing.whatsapp || null,
            listing.phone || null,
            listing.email || null,
            listing.instagram || null,
            primaryImage,
            JSON.stringify(imagesArray),
            true,
          ]
        )

        results.push({
          index: i,
          listing: {
            id: result.rows[0].id,
            title: result.rows[0].title,
            created_at: result.rows[0].created_at,
          },
        })
      } catch (error) {
        console.error(`Error al insertar listing ${i + 1}:`, error)
        insertErrors.push({ 
          index: i, 
          title: listing.title || `Producto ${i + 1}`, 
          error: 'Error al crear la publicación' 
        })
      }
    }

    return NextResponse.json(
      {
        message: `Importación completada: ${results.length} exitosos, ${errors.length + insertErrors.length} con errores`,
        success: results.length,
        validationErrors: errors.length,
        insertErrors: insertErrors.length,
        totalErrors: errors.length + insertErrors.length,
        results: results,
        validationErrorsDetails: errors,
        insertErrorsDetails: insertErrors,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al importar desde Excel:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo Excel' },
      { status: 500 }
    )
  }
}

