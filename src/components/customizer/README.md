# Contrato del personalizador

`ProductCustomizer` es la entrada pública. Recibe un `productSlug` explícitamente
soportado y puede emitir `CustomizerPreview | null` mediante `onPreviewChange`.

## Propiedad de object URLs

- El componente crea y posee `previewObjectUrl`.
- La URL sigue vigente hasta el siguiente resultado, hasta que el componente
  emite `null` o hasta que se desmonta.
- El componente revoca la URL anterior al reemplazarla y revoca la última al
  desmontarse.
- El consumidor no debe revocarla. Si necesita conservar la imagen después de
  ese ciclo, debe conservar el `Blob`, crear otra URL y administrar esa copia.

La imagen de origen se decodifica localmente y nunca se serializa en rutas,
storage, analítica o red. La ruta `/demo/personalizador` usa exclusivamente un
fixture técnico con marca de agua; no es una plantilla comercial.

La previsualización se regenera después de cada cambio de posición, escala o
rotación. Mientras el nuevo `Blob` está en proceso, la descarga permanece
deshabilitada para impedir que el usuario obtenga un PNG anterior al ajuste que
ve en pantalla. “Centrar imagen” conserva escala y rotación; “Restablecer
ajustes” vuelve a posición, escala y rotación iniciales.

## Activación comercial pendiente

Los cuatro slugs reales están en `src/data/customizer/supported-products.ts`,
pero `APPROVED_CUSTOMIZER_TEMPLATES` queda vacío hasta que el negocio entregue,
por referencia, un mockup base limpio, un overlay opcional y las coordenadas del
área imprimible. La ilustración SVG monolítica del catálogo no sustituye esos
recursos. Una plantilla aprobada debe usar `visualStatus: "approved"`; nunca se
debe mover un fixture de demo a ese mapa.

Las reglas puras y el ciclo del componente se ejecutan con `npm test` desde
`tests/unit/customizer` y `tests/component/customizer-workspace.test.tsx`. Las
pruebas de canvas real, mouse, tacto y viewports viven en
`tests/e2e/customizer.spec.ts` y se ejecutan con `npm run test:e2e` después del
build de producción.

## Integración

La ruta o página que monta el personalizador puede seguir siendo Server
Component, pero el callback debe vivir en un wrapper cliente porque las
funciones no son props serializables a través de la frontera servidor/cliente:

```tsx
"use client";

import { ProductCustomizer, type CustomizerPreview } from "@/components/customizer";

export function ProductCustomizerBridge({ productSlug }: { productSlug: string }) {
  const handlePreviewChange = (preview: CustomizerPreview | null) => {
    // Conservar el Blob solo en memoria para el flujo de integración.
  };

  return (
    <ProductCustomizer
      productSlug={productSlug}
      onPreviewChange={handlePreviewChange}
    />
  );
}
```
