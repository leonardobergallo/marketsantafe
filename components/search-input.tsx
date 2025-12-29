// Componente de búsqueda que actualiza query params
// TypeScript: Client Component con hooks
// En JavaScript sería similar pero sin tipos

'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  // Sincronizamos el valor con los query params cuando cambian
  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  // Determinar la ruta base según la página actual
  const basePath = pathname === '/mercado' ? '/mercado' : '/explorar'

  // Función para actualizar la búsqueda
  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }

    router.push(`${basePath}?${params.toString()}`)
  }

  // Función para manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue)
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar productos, servicios..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 pr-4 py-6 text-base"
      />
    </div>
  )
}


