/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desactivar source maps completamente
  productionBrowserSourceMaps: false,
  // Configuración de Turbopack (vacía para silenciar el warning)
  turbopack: {},
}

export default nextConfig
