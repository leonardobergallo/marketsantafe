# Configuración de MercadoPago

## Pasos para configurar MercadoPago en MarketSantaFe

### 1. Crear cuenta en MercadoPago

1. Ve a [MercadoPago](https://www.mercadopago.com.ar/)
2. Crea una cuenta o inicia sesión con tu cuenta de MercadoLibre
3. Completa la verificación de identidad si es necesario

### 2. Obtener credenciales de acceso

1. Ve a [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
2. Crea una nueva aplicación o selecciona una existente
3. Obtén tu **Access Token** (Token de acceso)
   - Para pruebas: Usa el **Access Token de prueba**
   - Para producción: Usa el **Access Token de producción**

### 3. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI

# URL base de tu aplicación (para webhooks y redirects)
NEXT_PUBLIC_BASE_URL=https://www.marketsantafe.com.ar
```

**⚠️ IMPORTANTE:**
- En desarrollo local, usa: `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- En producción, usa tu dominio real: `NEXT_PUBLIC_BASE_URL=https://www.marketsantafe.com.ar`
- **NUNCA** commitees tu Access Token al repositorio

### 4. Configurar Webhook

MercadoPago necesita una URL para enviar notificaciones de pago:

1. Ve a tu aplicación en [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
2. Configura la URL del webhook:
   - **Producción:** `https://www.marketsantafe.com.ar/api/payments/webhook`
   - **Pruebas:** Puedes usar [ngrok](https://ngrok.com/) para exponer tu servidor local:
     ```bash
     ngrok http 3000
     ```
     Luego usa: `https://tu-url-ngrok.ngrok.io/api/payments/webhook`

### 5. Probar la integración

#### Tarjetas de prueba

MercadoPago proporciona tarjetas de prueba para simular pagos:

**Tarjeta aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

**Tarjeta rechazada:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Más tarjetas de prueba:** [Documentación de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

### 6. Flujo de pago

1. Usuario selecciona un plan en `/planes`
2. Se crea una preferencia de pago en MercadoPago
3. Usuario es redirigido a MercadoPago para completar el pago
4. MercadoPago procesa el pago y redirige de vuelta:
   - **Éxito:** `/pago/exito`
   - **Error:** `/pago/error`
   - **Pendiente:** `/pago/pendiente`
5. MercadoPago envía una notificación al webhook
6. El webhook actualiza el estado del pago y activa la suscripción

### 7. Verificar pagos

Puedes verificar el estado de los pagos en:
- **Panel de MercadoPago:** [Actividad](https://www.mercadopago.com.ar/activities/list)
- **Base de datos:** Tabla `payments` y `subscriptions`
- **Página del usuario:** `/mi-suscripcion`

## Troubleshooting

### Error: "MercadoPago no está configurado"
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

### Webhook no recibe notificaciones
- Verifica que la URL del webhook esté correctamente configurada en MercadoPago
- En desarrollo, asegúrate de usar ngrok o una URL pública
- Revisa los logs del servidor para ver si hay errores

### Pago aprobado pero suscripción no se activa
- Verifica que el webhook esté funcionando correctamente
- Revisa los logs del servidor en `/api/payments/webhook`
- Verifica que el `external_reference` coincida con el formato esperado

### Error al crear preferencia de pago
- Verifica que el Access Token sea válido
- Asegúrate de estar usando el token correcto (prueba vs producción)
- Revisa que los montos sean válidos (números positivos)

## Recursos adicionales

- [Documentación oficial de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [SDK de Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)




