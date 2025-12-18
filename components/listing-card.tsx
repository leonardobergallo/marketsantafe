// Componente para mostrar una tarjeta de publicación
// TypeScript: definimos las props con una interfaz
// En JavaScript esto sería: export function ListingCard({ listing, ... }) { ... }

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { getCategoryById } from '@/lib/categories'
import { getZoneById } from '@/lib/zones'
import { type Listing } from '@/lib/mockListings'
import { MapPin, Calendar } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  // Obtenemos la categoría y zona usando los helpers
  // TypeScript: getCategoryById puede retornar undefined, por eso usamos || 'Desconocida'
  const category = getCategoryById(listing.categoryId)
  const zone = getZoneById(listing.zoneId)

  // Formateamos la fecha (en JavaScript sería similar pero sin tipos)
  const date = new Date(listing.createdAt)
  const formattedDate = date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })

  // Mapeamos la condición a un texto legible
  const conditionLabels: Record<string, string> = {
    nuevo: 'Nuevo',
    usado: 'Usado',
    reacondicionado: 'Reacondicionado',
  }

  return (
    <Link href={`/aviso/${listing.id}`}>
      <Card className="group cursor-pointer border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Imagen */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {/* Badge de condición */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {conditionLabels[listing.condition] || listing.condition}
            </Badge>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Precio */}
          <div className="mb-2">
            <span className="text-2xl font-bold text-foreground">
              {listing.price > 0 ? formatPrice(listing.price) : 'Consultar'}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-semibold text-base text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Descripción corta */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {listing.description}
          </p>

          {/* Meta información */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-auto">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
            )}
            {zone && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{zone.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

