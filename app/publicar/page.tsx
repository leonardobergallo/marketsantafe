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
import { Card } from '@/components/ui/card'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { type Condition } from '@/lib/mockListings'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

type VerticalType = 'mercado' | 'gastronomia' | null

export default function PublicarPage() {
  const router = useRouter()
  
  // Estado para la vertical seleccionada
  const [vertical, setVertical] = useState<VerticalType>(null)
  
  // Estado del formulario MERCADO
  const [formDataMercado, setFormDataMercado] = useState({
    title: '',
    categoryId: 'all',
    zoneId: 'all',
    price: '',
    condition: '' as Condition | '',
    description: '',
    whatsapp: '',
    phone: '',
  })

  // Estado del formulario GASTRONOMÍA
  const [formDataGastronomia, setFormDataGastronomia] = useState({
    name: '',
    foodType: '',
    zoneId: 'all',
    description: '',
    hours: '',
    whatsapp: '',
    phone: '',
    delivery: false,
    pickup: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para manejar cambios en los inputs MERCADO
  const handleChangeMercado = (field: string, value: string) => {
    setFormDataMercado((prev) => ({ ...prev, [field]: value }))
  }

  // Función para manejar cambios en los inputs GASTRONOMÍA
  const handleChangeGastronomia = (field: string, value: string | boolean) => {
    setFormDataGastronomia((prev) => ({ ...prev, [field]: value }))
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (vertical === 'mercado') {
      // Validación mercado
      if (!formDataMercado.title || formDataMercado.zoneId === 'all' || !formDataMercado.description) {
        toast.error('Por favor completa todos los campos obligatorios')
        setIsSubmitting(false)
        return
      }
    } else if (vertical === 'gastronomia') {
      // Validación gastronomía
      if (!formDataGastronomia.name || formDataGastronomia.zoneId === 'all' || !formDataGastronomia.description) {
        toast.error('Por favor completa todos los campos obligatorios')
        setIsSubmitting(false)
        return
      }
    }

    // Simulamos el envío
    setTimeout(() => {
      toast.success('¡Publicación creada exitosamente!')
      setIsSubmitting(false)
      router.push(vertical === 'mercado' ? '/mercado' : '/comer')
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
            Publicá en menos de 1 minuto
          </h1>
          <p className="text-muted-foreground">
            Publicá fácil, vendé directo
          </p>
        </div>

        {/* Selector de vertical - Paso 1 */}
        {!vertical && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              ¿Qué querés publicar?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setVertical('mercado')}
                className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
              >
                <ShoppingBag className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Mercado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Productos, servicios, alquileres
                </p>
              </button>
              <button
                onClick={() => setVertical('gastronomia')}
                className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
              >
                <UtensilsCrossed className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Gastronomía
                </h3>
                <p className="text-sm text-muted-foreground">
                  Restaurantes, locales, delivery
                </p>
              </button>
            </div>
          </Card>
        )}

        {/* Formulario MERCADO */}
        {vertical === 'mercado' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Publicar en Mercado</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setVertical(null)}
              >
                Cambiar
              </Button>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Departamento 2 ambientes en Centro"
                value={formDataMercado.title}
                onChange={(e) => handleChangeMercado('title', e.target.value)}
                required
              />
            </div>

            {/* Categoría y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formDataMercado.categoryId}
                  onValueChange={(value) => handleChangeMercado('categoryId', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">
                  Zona <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formDataMercado.zoneId}
                  onValueChange={(value) => handleChangeMercado('zoneId', value)}
                  required
                >
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Selecciona zona</SelectItem>
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
                  value={formDataMercado.price}
                  onChange={(e) => handleChangeMercado('price', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deja en 0 o vacío para "Consultar precio"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condición</Label>
                <Select
                  value={formDataMercado.condition}
                  onValueChange={(value) => handleChangeMercado('condition', value)}
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
                value={formDataMercado.description}
                onChange={(e) => handleChangeMercado('description', e.target.value)}
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
                  value={formDataMercado.whatsapp}
                  onChange={(e) => handleChangeMercado('whatsapp', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3425123456"
                  value={formDataMercado.phone}
                  onChange={(e) => handleChangeMercado('phone', e.target.value)}
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
        )}

        {/* Formulario GASTRONOMÍA */}
        {vertical === 'gastronomia' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Publicar en Gastronomía</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setVertical(null)}
              >
                Cambiar
              </Button>
            </div>

            {/* Nombre del local */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del local <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Pizzería El Buen Sabor"
                value={formDataGastronomia.name}
                onChange={(e) => handleChangeGastronomia('name', e.target.value)}
                required
              />
            </div>

            {/* Tipo de comida y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodType">Tipo de comida</Label>
                <Input
                  id="foodType"
                  placeholder="Ej: Pizza, Comida Casera, Sushi"
                  value={formDataGastronomia.foodType}
                  onChange={(e) => handleChangeGastronomia('foodType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone-gastro">
                  Zona <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formDataGastronomia.zoneId}
                  onValueChange={(value) => handleChangeGastronomia('zoneId', value)}
                  required
                >
                  <SelectTrigger id="zone-gastro">
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Selecciona zona</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description-gastro">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description-gastro"
                placeholder="Describe tu local, especialidades..."
                rows={6}
                value={formDataGastronomia.description}
                onChange={(e) => handleChangeGastronomia('description', e.target.value)}
                required
              />
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <Label htmlFor="hours">Horarios</Label>
              <Input
                id="hours"
                placeholder="Ej: Lun-Vie 12:00-15:00, 19:00-23:00"
                value={formDataGastronomia.hours}
                onChange={(e) => handleChangeGastronomia('hours', e.target.value)}
              />
            </div>

            {/* Delivery / Retiro */}
            <div className="space-y-2">
              <Label>Servicios</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formDataGastronomia.delivery}
                    onChange={(e) => handleChangeGastronomia('delivery', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Delivery</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formDataGastronomia.pickup}
                    onChange={(e) => handleChangeGastronomia('pickup', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Retiro</span>
                </label>
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-gastro">WhatsApp</Label>
                <Input
                  id="whatsapp-gastro"
                  type="tel"
                  placeholder="3425123456"
                  value={formDataGastronomia.whatsapp}
                  onChange={(e) => handleChangeGastronomia('whatsapp', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-gastro">Teléfono</Label>
                <Input
                  id="phone-gastro"
                  type="tel"
                  placeholder="3425123456"
                  value={formDataGastronomia.phone}
                  onChange={(e) => handleChangeGastronomia('phone', e.target.value)}
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
                {isSubmitting ? 'Publicando...' : 'Publicar local'}
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
        )}
      </main>
      <Footer />
    </div>
  )
}
