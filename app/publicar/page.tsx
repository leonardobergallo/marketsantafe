// Página para publicar un nuevo aviso
// TypeScript: este componente es un Client Component porque usa hooks de formulario
// En JavaScript sería similar pero sin tipos

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { type Condition } from '@/lib/mockListings'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PublicarPage() {
  const router = useRouter()
  
  // Estado del formulario
  // TypeScript: definimos el tipo del estado
  // En JavaScript sería: const [formData, setFormData] = useState({ ... })
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    zoneId: '',
    price: '',
    condition: '' as Condition | '',
    description: '',
    whatsapp: '',
    phone: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para manejar cambios en los inputs
  // TypeScript: el evento tiene tipo específico
  // En JavaScript sería: const handleChange = (e) => { ... }
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validación básica
    if (!formData.title || !formData.categoryId || !formData.zoneId || !formData.description) {
      toast.error('Por favor completa todos los campos obligatorios')
      setIsSubmitting(false)
      return
    }

    // Simulamos el envío (en producción esto haría un POST a la API)
    // TypeScript: setTimeout necesita un tipo para el callback
    // En JavaScript sería: setTimeout(() => { ... }, 1000)
    setTimeout(() => {
      toast.success('¡Publicación creada exitosamente!')
      setIsSubmitting(false)
      // Redirigimos a la página de explorar
      router.push('/explorar')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl">
        {/* Header de la página */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Publicar un aviso
          </h1>
          <p className="text-muted-foreground">
            Completa el formulario para publicar tu aviso en MarketSantaFe
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Departamento 2 ambientes en Centro"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* Categoría y Zona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleChange('categoryId', value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone">
                Zona <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.zoneId}
                onValueChange={(value) => handleChange('zoneId', value)}
                required
              >
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Precio y Condición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (ARS)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deja en 0 o vacío para "Consultar precio"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condición</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleChange('condition', value)}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Selecciona condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                  <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto o servicio..."
              rows={6}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="3425123456"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="3425123456"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Fotos (placeholder) */}
          <div className="space-y-2">
            <Label>Fotos</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Subida de fotos disponible próximamente
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar aviso'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

