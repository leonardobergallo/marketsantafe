// Página pública para ver una propiedad inmobiliaria
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pool } from '@/lib/db'
import { PropertyDetailClient } from './PropertyDetailClient'

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  try {
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return null
    }

    // Obtener propiedad
    const result = await pool.query(
      `SELECT 
        p.*,
        z.name as zone_name,
        z.slug as zone_slug,
        u.name as user_name,
        u.phone as user_phone,
        u.whatsapp as user_whatsapp,
        u.email as user_email
       FROM properties p
       LEFT JOIN zones z ON p.zone_id = z.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.active = true`,
      [propertyId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]

    // Parsear imágenes
    let images: string[] = []
    if (row.images) {
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
      } catch (e) {
        images = []
      }
    }
    if (images.length === 0 && row.image_url) {
      images = [row.image_url]
    }

    // Incrementar vistas
    await pool.query(
      'UPDATE properties SET views = views + 1 WHERE id = $1',
      [propertyId]
    )

    return {
      id: row.id.toString(),
      type: row.type,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      currency: row.currency || 'ARS',
      rooms: row.rooms,
      bathrooms: row.bathrooms,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
      address: row.address,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      images,
      image_url: row.image_url,
      phone: row.phone || row.user_phone,
      whatsapp: row.whatsapp || row.user_whatsapp,
      email: row.email || row.user_email,
      instagram: row.instagram,
      professional_service: row.professional_service,
      featured: row.featured,
      views: (row.views || 0) + 1,
      created_at: row.created_at,
      zone_name: row.zone_name,
      zone_slug: row.zone_slug,
      user_name: row.user_name,
      user_id: row.user_id,
    }
  } catch (error) {
    console.error('Error obteniendo propiedad:', error)
    return null
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alquiler':
        return 'Alquiler'
      case 'venta':
        return 'Venta'
      case 'alquiler-temporal':
        return 'Alquiler Temporal'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alquiler':
        return 'bg-blue-100 text-blue-800'
      case 'venta':
        return 'bg-green-100 text-green-800'
      case 'alquiler-temporal':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
          {/* Botón volver */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/propiedades">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a propiedades
              </Link>
            </Button>
          </div>

          <PropertyDetailClient property={property} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

