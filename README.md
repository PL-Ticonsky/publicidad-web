# Tinta — catálogo y cotizador frontend

Landing comercial para explorar productos promocionales, configurar una cotización aproximada en el navegador y continuar la conversación con la empresa por WhatsApp.

La aplicación no usa base de datos, API propia, autenticación ni persistencia de clientes o cotizaciones. Todo el catálogo y todas las reglas de precio están versionados como archivos TypeScript.

## Flujo

```text
Landing → catálogo → detalle del producto → cotizador → WhatsApp
```

- `/`: landing, categorías y productos destacados.
- `/catalogo`: catálogo local con búsqueda, filtros y ordenamiento.
- `/producto/[slug]`: ficha del producto, imágenes, técnicas y mínimos.
- `/cotizador?producto=[slug]`: configuración y cálculo local.

Los datos del formulario se utilizan exclusivamente para construir el mensaje. No se envían a un servidor ni se almacenan en el navegador.

## Ejecutar el proyecto

Requisitos: Node.js 20 o posterior y npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para comprobar una versión de producción:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

## Configuración

La única variable requerida para completar solicitudes es:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
```

Usa el código del país y solo dígitos. Al generar el enlace, la aplicación también elimina automáticamente espacios, `+`, guiones y cualquier carácter no numérico.

## Editar el catálogo

La información está separada por responsabilidad:

- `src/data/products.ts`: productos, slugs, mínimos, imágenes y tramos de precio.
- `src/data/categories.ts`: categorías.
- `src/data/techniques.ts`: técnicas, preparación y precio por unidad.
- `src/data/additionals.ts`: adicionales y forma de cobro.
- `public/products/`: recursos visuales locales.

Las funciones `getAllActiveProducts`, `getFeaturedProducts`, `getProductBySlug` y `getProductsByCategory` evitan que la interfaz repita filtros sobre los arreglos.

### Agregar un producto

1. Agrega su categoría en `categories.ts` si todavía no existe.
2. Agrega las técnicas y adicionales necesarios en sus respectivos archivos.
3. Guarda sus imágenes en `public/products/`.
4. Añade un objeto a `products.ts` con un `id` y `slug` únicos.
5. Comprueba que `categoryId`, `availableTechniqueIds` y `availableAdditionalIds` apunten a registros existentes.
6. Define `pricingType` y tramos coherentes. Para un precio que deba revisar un asesor usa `quote-only` y no agregues una cifra ficticia.
7. Ejecuta lint, TypeScript y build.

## Motor de cotización

`src/lib/quotation/` contiene funciones puras, independientes de React:

- `validate-quotation.ts`: valida cantidades y opciones disponibles.
- `get-price-tier.ts`: selecciona el tramo aplicable.
- `calculate-quote.ts`: calcula base, técnica, adicionales, costos fijos, IVA y total estimado.

El resultado conserva números sin formatear. El formato COP está centralizado en `src/lib/format.ts`.

Los productos `quote-only` devuelven un resultado explícito sin importes; la interfaz y el mensaje indican que el precio está pendiente de validación.

## WhatsApp

`src/lib/whatsapp/` valida y normaliza el número, compone el mensaje, lo codifica y construye la URL `https://wa.me/`. El cotizador abre el enlace con `noopener,noreferrer`.

El mensaje incluye:

- datos proporcionados por el solicitante;
- producto, cantidad, técnica y adicionales;
- desglose estimado o aviso de validación por asesor;
- advertencia de que el valor final puede variar.

## Despliegue

La aplicación puede desplegarse en cualquier plataforma compatible con Next.js 16:

1. configura `NEXT_PUBLIC_WHATSAPP_NUMBER` en el entorno de producción;
2. instala dependencias con `npm ci`;
3. genera el artefacto con `npm run build`;
4. inicia con `npm start`, o usa la integración nativa de la plataforma.

No es necesario aprovisionar base de datos, funciones, almacenamiento ni secretos de backend.
