'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'
import Link from 'next/link'

interface EditButtonProps {
  listingId: string
  className?: string
}

export function EditButtonClient({ listingId, className }: EditButtonProps) {
  const router = useRouter()
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        // Verificar autenticación
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          setIsOwner(false)
          setIsLoading(false)
          return
        }
        const authData = await authResponse.json()

        // Verificar que el listing pertenece al usuario
        const listingResponse = await fetch(`/api/listings/${listingId}`)
        if (!listingResponse.ok) {
          setIsOwner(false)
          setIsLoading(false)
          return
        }
        const listingData = await listingResponse.json()

        setIsOwner(listingData.user_id === authData.user.id)
      } catch (error) {
        console.error('Error verificando ownership:', error)
        setIsOwner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkOwnership()
  }, [listingId])

  if (isLoading || !isOwner) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={className}
    >
      <Link href={`/editar/${listingId}`}>
        <Edit2 className="h-4 w-4 mr-2" />
        Editar
      </Link>
    </Button>
  )
}

