import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function ComerPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Gastronomía</h1>
          <p className="text-muted-foreground">
            Esta sección estará disponible próximamente.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
