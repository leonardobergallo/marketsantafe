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
  // NO excluir imágenes - necesitamos que estén disponibles en producción
  // outputFileTracingExcludes: {
  //   '*': [
  //     'public/uploads/**/*',
  //     'public/uploads/images/**/*',
  //     'public/images/**/*',
  //   ],
  // },
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
