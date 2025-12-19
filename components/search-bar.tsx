// Barra de búsqueda principal en el home
// TypeScript: este es un Client Component porque usa hooks y navegación
// En JavaScript sería similar pero sin tipos

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/categories"
import { zones } from "@/lib/zones"

export function SearchBar() {
  const router = useRouter()
  // Estado del formulario de búsqueda
  // TypeScript: definimos el tipo del estado
  // En JavaScript sería: const [search, setSearch] = useState({ ... })
  const [search, setSearch] = useState({
    q: '',
    categoryId: 'all', // Valor inicial "all" para mostrar "Todas las categorías"
    zoneId: 'all', // Valor inicial "all" para mostrar "Todas las zonas"
  })

  // Función para manejar la búsqueda
  const handleSearch = () => {
    // Construimos los query params
    // TypeScript: filtramos valores vacíos y "all" (valor especial para "todas")
    // En JavaScript sería similar pero sin tipos
    const params = new URLSearchParams()
    if (search.q) params.set('q', search.q)
    if (search.categoryId && search.categoryId !== 'all') params.set('cat', search.categoryId)
    if (search.zoneId && search.zoneId !== 'all') params.set('zone', search.zoneId)

    // Navegamos a /mercado con los filtros
    const queryString = params.toString()
    router.push(`/mercado${queryString ? `?${queryString}` : ''}`)
  }

  // Función para manejar Enter en el input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-8 pb-12 md:pb-16 lg:pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <label htmlFor="search-input" className="sr-only">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 h-4 sm:h-5 w-4 sm:w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="search-input"
                  type="search"
                  placeholder="¿Qué estás buscando?"
                  className="w-full rounded-lg border border-input bg-background pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  value={search.q}
                  onChange={(e) => setSearch({ ...search, q: e.target.value })}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={search.categoryId}
                onValueChange={(value) => setSearch({ ...search, categoryId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={search.zoneId}
                onValueChange={(value) => setSearch({ ...search, zoneId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold"
            >
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
