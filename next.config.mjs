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
    ]
  },
}

export default nextConfig
