'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyChat } from '@/components/property-chat'
import { MessageCircle, Phone } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  condition: string
  imageUrl: string
  images?: string[]
  whatsapp?: string
  phone?: string
  category?: {
    id: string
    name: string
  }
  zone?: {
    id: string
    name: string
  }
  createdAt: string
}

interface AvisoDetailClientProps {
  listing: Listing
}

export function AvisoDetailClient({ listing }: AvisoDetailClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // URLs para contacto
  const whatsappUrl = listing.whatsapp
    ? `https://wa.me/54${listing.whatsapp.replace(/\D/g, '')}`
    : null
  const phoneUrl = listing.phone ? `tel:+54${listing.phone.replace(/\D/g, '')}` : null

  return (
    <>
      {/* Columna lateral - Contacto */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Contacto</h2>
          <div className="space-y-3">
            <Button
              onClick={() => setIsChatOpen(true)}
              className="w-full"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chatear con el vendedor
            </Button>
            {whatsappUrl && (
              <Button
                asChild
                variant="outline"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar por WhatsApp
                </a>
              </Button>
            )}
            {phoneUrl && (
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <a href={phoneUrl}>
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </a>
              </Button>
            )}
            {!whatsappUrl && !phoneUrl && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay información de contacto disponible
              </p>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
            {listing.category && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-medium">{listing.category.name}</span>
              </div>
            )}
            {listing.zone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zona:</span>
                <span className="font-medium">{listing.zone.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condición:</span>
              <span className="font-medium">{listing.condition}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Modal */}
      <PropertyChat
        listingId={parseInt(listing.id)}
        title={listing.title}
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  )
}

