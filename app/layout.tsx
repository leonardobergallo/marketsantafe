import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { ChatbotCleanup } from "@/components/chatbot-cleanup"
import "./globals.css"

// Interceptor global del chatbot - debe ejecutarse antes que cualquier script
const chatbotInterceptor = `
  (function() {
    if (typeof window === 'undefined') return;
    
    // Configurar la URL del servidor para usar rutas proxy locales
    window.INMOBILIARIA_CHATBOT_API = window.location.origin;
    
    // Interceptar fetch ANTES de que cualquier script se cargue
    if (!window.__chatbotFetchIntercepted) {
      window.__chatbotFetchIntercepted = true;
      
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
          const proxyUrl = url.replace(
            'https://inmobiliariaenquipo.vercel.app',
            window.location.origin
          );
          console.log('🔄 [Chatbot] Interceptando fetch:', url, '→', proxyUrl);
          const newArgs = [proxyUrl, ...Array.from(args).slice(1)];
          return originalFetch.apply(this, newArgs);
        }
        return originalFetch.apply(this, args);
      };
      
      // También interceptar XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
          const proxyUrl = url.replace(
            'https://inmobiliariaenquipo.vercel.app',
            window.location.origin
          );
          console.log('🔄 [Chatbot] Interceptando XHR:', url, '→', proxyUrl);
          return originalXHROpen.call(this, method, proxyUrl, ...rest);
        }
        return originalXHROpen.call(this, method, url, ...rest);
      };
      
      console.log('✅ [Chatbot] Interceptor global instalado');
    }
  })();
`

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MarketSantaFe - Comprá, vendé o alquilá en Santa Fe",
  description:
    "Marketplace local para comprar, vender o alquilar productos y servicios en Santa Fe, Argentina. Fácil, rápido y sin vueltas.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {/* Interceptor del chatbot - debe ejecutarse lo más temprano posible */}
        <Script
          id="chatbot-interceptor-global"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: chatbotInterceptor }}
        />
        {children}
        <ChatbotCleanup />
        <Analytics />
      </body>
    </html>
  )
}
