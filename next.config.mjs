/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  // Desactivar source maps completamente
  productionBrowserSourceMaps: false,
  // Configuración de Turbopack (vacía para silenciar el warning)
  turbopack: {},
  // Excluir imágenes del tracing de funciones API para evitar exceder límite de 300MB
  // Las imágenes seguirán disponibles como archivos estáticos en /uploads y /images
  outputFileTracingExcludes: {
    // Excluir imágenes de TODAS las funciones API para reducir el tamaño del bundle
    // Las imágenes se sirven como archivos estáticos desde public/, no desde las funciones
    '*': [
      'public/uploads/**/*',
      'public/uploads/images/**/*',
      'public/images/**/*',
    ],
  },
  // Asegurar que los archivos estáticos se sirvan correctamente
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
