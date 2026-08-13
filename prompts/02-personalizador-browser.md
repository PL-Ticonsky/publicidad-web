# Prompt — rama `feat/personalizador-browser`

Estás trabajando en la rama `feat/personalizador-browser` de Propagplast.

Lee completamente `AGENTS.md`, `docs/PRODUCT_SCOPE.md` y `docs/CUSTOMIZER_SPEC.md`. Inspecciona el catálogo, los slugs y los assets reales antes de editar. Puedes usar subagentes solamente para exploración de activos, revisión de APIs del navegador y diseño de pruebas. Tú serás el único agente que edite esta rama.

## Objetivo

Construir un componente reutilizable de personalización 100 % local para los llaveros y mouse pads reales del catálogo. El usuario debe cargar una imagen, ubicarla dentro del área imprimible, escalarla, rotarla, restablecerla y exportar una previsualización PNG.

No modifiques el cotizador, las reglas monetarias, WhatsApp, adicionales, encabezados de seguridad ni el rediseño general.

## Primera fase: descubrimiento

Antes de programar:

1. Enumera los slugs reales que parezcan llaveros o mouse pads.
2. Enumera los assets existentes para esas referencias con dimensiones y formato.
3. Determina cuáles sirven como base limpia, máscara o overlay.
4. Si no existen activos aprobados, separa motor de render y fixtures. No presentes un placeholder como diseño de producción.
5. Revisa si una solución con Canvas 2D y APIs nativas es suficiente antes de añadir una dependencia.

## Arquitectura requerida

Crea dominios aislados equivalentes a:

- `src/components/customizer/**`
- `src/lib/customizer/**`
- `src/data/customizer/**`
- `src/types/customizer.ts`
- pruebas relacionadas
- ruta de demostración aislada solamente si es necesaria

Expón un componente equivalente a:

```tsx
<ProductCustomizer
  productSlug={productSlug}
  onPreviewChange={handlePreviewChange}
/>
```

El callback debe producir `null` o un resultado con slug, nombre original, `Blob`, object URL y dimensiones. Documenta claramente quién crea y quién revoca cada object URL.

## Funcionalidad requerida

1. Habilita únicamente slugs soportados mediante configuración explícita.
2. Acepta PNG, JPEG y WebP.
3. Rechaza archivos mayores de 10 MiB, imágenes mayores de 25 MP, MIME no permitido y decodificación fallida.
4. No aceptes SVG ni confíes solo en la extensión.
5. Permite:
   - cargar/reemplazar/eliminar;
   - arrastrar con mouse y táctil;
   - controlar zoom;
   - controlar rotación;
   - centrar/restablecer;
   - descargar PNG.
6. Recorta estrictamente al área imprimible.
7. Compone base, diseño y overlay en el orden correcto.
8. Mantén controles accesibles y utilizables sin drag.
9. Muestra estados vacío, procesando, listo, inválido y error.
10. Libera recursos al reemplazar archivo y desmontar.
11. No guardes la imagen en servidor, URL, localStorage, sessionStorage, analítica o logs.
12. No intentes adjuntar el archivo a WhatsApp.
13. Muestra “Previsualización orientativa” y la limitación aprobada en la UI.

## Restricción de integración

No edites `product-quote-calculator.tsx` ni rutas existentes de cotización/producto para conectar el componente. Si necesitas verificarlo, crea una ruta de demostración aislada y claramente removible. La rama de integración hará el montaje final.

## Pruebas obligatorias

Cubre como mínimo:

- slug soportado/no soportado;
- archivo PNG/JPEG/WebP válido;
- MIME inválido y decodificación fallida;
- tamaño y megapíxeles excesivos;
- reemplazo y eliminación;
- transformación y restablecimiento;
- recorte del área imprimible;
- exportación con dimensiones correctas;
- orden de capas;
- callback con resultado y `null`;
- limpieza de object URLs;
- teclado, nombres accesibles y mensajes de error;
- 320, 390, 768 y escritorio;
- gestos táctiles básicos si se implementan.

## Criterios de aceptación

- Llaveros y mouse pads se habilitan por slugs reales, no por coincidencias frágiles de texto en runtime.
- La imagen nunca sale del navegador.
- Un archivo inválido nunca llega al canvas de producción.
- El diseño no desborda el área imprimible.
- La descarga PNG no contiene controles de UI.
- Reemplazar imágenes no acumula object URLs.
- El componente puede integrarse sin reescribir su motor.
- Si faltan mockups, el motor queda completo y la limitación se reporta de forma inequívoca.
- Lint, TypeScript, pruebas y build pasan.
- No tocaste archivos propietarios de cotizador/calidad.

## Entrega

Revisa el diff y crea commits descriptivos. En la respuesta final incluye:

1. slugs y activos encontrados;
2. arquitectura elegida y por qué;
3. contrato público del componente;
4. archivos modificados;
5. pruebas y resultados;
6. comportamiento móvil y táctil verificado;
7. activos faltantes o limitaciones visuales;
8. pasos exactos de integración;
9. hash o hashes de commit.

