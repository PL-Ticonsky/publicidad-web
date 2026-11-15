<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# AGENTS.md — Propagplast

## Objetivo del producto

Propagplast es un catálogo comercial y generador de solicitudes estimadas. El usuario configura un producto, observa un desglose y continúa la conversación mediante WhatsApp.

Esta versión no es un ERP, CRM ni sistema persistente. No registra clientes, no crea cotizaciones formales y no almacena artes en un servidor.

## Fuente de verdad

Antes de editar:

1. Lea este archivo completo.
2. Lea `docs/PRODUCT_SCOPE.md`.
3. Lea `docs/CUSTOMIZER_SPEC.md` si la tarea toca personalización.
4. Inspeccione el código real y confirme los slugs, scripts y contratos existentes. No los adivine.
5. Revise `AUDITORIA_TINTA.md` si existe en el repositorio.

Cuando un documento y el código difieran, reporte la discrepancia antes de ampliar el alcance. Los precios, impuestos, promociones y atributos comerciales requieren una fuente aprobada; nunca invente valores.

## Stack observado

- Next.js con App Router.
- React y TypeScript estricto.
- Tailwind CSS.
- Catálogo local en TypeScript.
- Cotización calculada en el navegador.
- WhatsApp mediante URL `wa.me`.
- Sin base de datos ni API propia en el alcance actual.

Verifique las versiones reales en `package.json`; no dependa de las versiones escritas en este documento.

## Límites obligatorios

- No añadir Supabase, PostgreSQL, ORM, autenticación, panel administrativo ni almacenamiento remoto.
- No modificar precios, IVA, mínimos o promociones sin evidencia suministrada por el negocio.
- No enviar mensajes reales a WhatsApp durante pruebas.
- No guardar imágenes cargadas por el usuario en servidor, analítica, logs, URL, localStorage o repositorio.
- No introducir fotografías generadas por IA como si fueran productos reales.
- No aceptar SVG en el personalizador de esta versión.
- No afirmar que una estimación es una cotización formal.
- No usar `0` para representar un precio desconocido.
- No mostrar un total como definitivo si contiene cargos sin precio confirmado.
- No ejecutar migraciones, publicar a producción, comprar dominios ni cambiar DNS desde estas ramas.
- No mezclar cambios del rediseño visual general que se está desarrollando por separado.

## Contratos de ramas

### `fix/cotizador-calidad`

Propietaria de:

- `src/components/product-quote-calculator.tsx`
- `src/lib/quotation/**`
- `src/lib/whatsapp/**`
- validación relacionada con cotización y contacto
- `src/data/additionals.ts` cuando sea necesario para modelar precios desconocidos
- pruebas del cotizador y WhatsApp
- scripts de calidad, configuración de pruebas y actualizaciones de dependencias
- `next.config.ts` para encabezados de seguridad

No debe crear ni editar `src/components/customizer/**`, `src/lib/customizer/**`, `src/data/customizer/**` ni recursos del personalizador.

### `feat/personalizador-browser`

Propietaria de:

- `src/components/customizer/**`
- `src/lib/customizer/**`
- `src/data/customizer/**`
- `src/types/customizer.ts`
- pruebas del personalizador
- una ruta aislada de demostración, si hace falta para verificar la función
- recursos aprobados bajo `public/**/customizer/**`

No debe editar `product-quote-calculator.tsx`, `src/lib/quotation/**`, `src/lib/whatsapp/**`, `additionals.ts`, `next.config.ts`, precios ni mensajes de WhatsApp.

### Integración

Solo `integration/propagplast-v1` conecta ambos trabajos. Esa rama decide dónde renderizar `ProductCustomizer`, cómo propagar su estado al cotizador y cómo mencionar la previsualización en el mensaje.

Si una rama necesita tocar un archivo propiedad de la otra, deténgase, documente la necesidad y deje una recomendación para integración. No edite el archivo.

## Contrato del cotizador

- Todos los importes monetarios deben seguir una política explícita y probada.
- Prefiera unidades enteras de COP mientras las reglas del negocio lo permitan.
- La tasa de IVA debe tener una única fuente de verdad.
- Las cantidades deben ser enteros positivos, seguros y limitados por una regla razonable o por producto.
- Un cargo debe distinguir al menos entre `priced` y `requiresQuote`.
- Si existe un cargo `requiresQuote`, el resultado debe decir “estimación parcial” o “requiere validación”; no debe incorporarlo como cero silencioso.
- El texto visible, el cálculo y el mensaje de WhatsApp deben derivarse del mismo resultado de dominio.
- El botón de envío debe bloquear doble clic y reapertura duplicada.
- El teléfono de destino debe validarse al iniciar o construir la aplicación.
- La información de contacto debe normalizarse y tener límites de longitud.

## Contrato del personalizador

- Solo habilitado inicialmente para productos reales de llaveros y mouse pads encontrados en el catálogo.
- Procesamiento 100 % local con `File`, `Blob`, `URL.createObjectURL` y/o Canvas.
- Formatos permitidos: PNG, JPEG y WebP.
- Tamaño máximo inicial: 10 MiB.
- Resolución máxima inicial: 25 megapíxeles; decodifique antes de aceptar definitivamente.
- Debe permitir mover, escalar, rotar, restablecer y exportar una previsualización PNG.
- El diseño debe quedar recortado al área imprimible.
- Libere object URLs y recursos cuando cambie el archivo o se desmonte el componente.
- No serialice `Blob` o data URLs en parámetros de URL.
- No persista la imagen entre sesiones.
- No prometa fidelidad de color, escala o acabado; muestre que es una simulación visual.
- Si faltan mockups aprobados, construya el motor y fixtures de prueba, pero marque la salida de producción como bloqueada. No invente un mockup comercial definitivo.

## Interfaz prevista para integración

El personalizador debe exponer una interfaz equivalente a:

```ts
export type CustomizerPreview = {
  productSlug: string;
  sourceFileName: string;
  previewBlob: Blob;
  previewObjectUrl: string;
  width: number;
  height: number;
};

export type ProductCustomizerProps = {
  productSlug: string;
  onPreviewChange?: (preview: CustomizerPreview | null) => void;
};
```

Puede ajustar nombres al estilo del repositorio, pero mantenga estas propiedades semánticas. El consumidor es responsable de descargar o utilizar el `Blob`; el componente es responsable de revocar las URLs que crea según un contrato documentado y probado.

## Calidad y pruebas

Antes de declarar terminado:

1. Ejecute los scripts reales definidos en `package.json`.
2. Como mínimo verifique lint, TypeScript, pruebas y build de producción.
3. Añada pruebas unitarias para toda regla de cálculo o transformación nueva.
4. Añada pruebas de integración del componente cuando exista interacción significativa.
5. Verifique 320, 390, 768 y 1440 px cuando cambie UI.
6. Intercepte `window.open`; ninguna prueba debe abrir WhatsApp real.
7. Revise consola y errores de red.
8. Inspeccione `git diff --check` y el diff completo.

Comandos esperados después de que exista el script de pruebas:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
git diff --check
```

No oculte fallos con `eslint-disable`, `@ts-ignore`, casts inseguros o retiro de pruebas. Corrija la causa o documente un bloqueo real.

## Dependencias

- Inspeccione primero si la plataforma web nativa resuelve el problema.
- Antes de añadir una dependencia de producción, justifique tamaño, mantenimiento, seguridad y necesidad.
- No ejecute actualizaciones masivas sin revisar changelog, lockfile, build y regresiones.
- No use `npm audit fix --force` de manera automática.
- Consulte documentación vigente cuando una API o versión pueda haber cambiado.

## Git y entrega

- Mantenga la rama dentro de su contrato.
- Haga commits pequeños y descriptivos.
- No reescriba historia compartida.
- No use comandos destructivos para limpiar cambios ajenos.
- No mezcle refactors cosméticos no relacionados.
- Al terminar, entregue: resumen, decisiones, archivos modificados, comandos ejecutados, resultados, riesgos, trabajo pendiente y hash de commit.

## Definición de terminado

Una tarea está terminada solamente cuando:

- cumple los criterios de aceptación de su prompt;
- no invade la propiedad de la otra rama;
- lint, TypeScript, pruebas y build pasan;
- no hay errores nuevos de consola;
- los estados vacíos, inválidos, cargando y error están cubiertos cuando aplican;
- el comportamiento móvil fue verificado;
- la documentación describe cualquier decisión no obvia;
- el diff está revisado y confirmado en Git.

