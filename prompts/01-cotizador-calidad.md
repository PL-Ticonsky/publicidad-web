# Prompt — rama `fix/cotizador-calidad`

Estás trabajando en la rama `fix/cotizador-calidad` de Propagplast.

Lee completamente `AGENTS.md`, `docs/PRODUCT_SCOPE.md` y `AUDITORIA_TINTA.md` si existe. Inspecciona el repositorio antes de editar. Usa subagentes en paralelo únicamente para tareas de lectura: uno puede revisar cálculo y validación, otro dependencias/seguridad y otro cobertura de pruebas. Espera sus resultados y conserva tú la responsabilidad de todas las ediciones.

## Objetivo

Convertir el cotizador frontend actual en un generador de solicitudes estimadas confiable, seguro y verificable, sin añadir base de datos, almacenamiento, autenticación ni backend.

No trabajes en identidad visual general y no crees ningún personalizador.

## Propiedad de archivos

Puedes modificar exclusivamente los dominios autorizados por `AGENTS.md`, especialmente:

- `src/components/product-quote-calculator.tsx`
- `src/lib/quotation/**`
- `src/lib/whatsapp/**`
- validación de datos del formulario
- `src/data/additionals.ts` si es necesario para representar precios desconocidos
- configuración y archivos de pruebas
- `package.json` y lockfile para calidad o actualizaciones controladas
- `next.config.ts` para seguridad

No modifiques ningún archivo dentro de `customizer` ni construyas la integración futura.

## Trabajo requerido

1. Reproduce primero los hallazgos aplicables de la auditoría y escribe una tabla corta de confirmado/no reproducido.
2. Define y documenta una política monetaria única:
   - fuente única de IVA;
   - unidad interna;
   - momento y método de redondeo;
   - igualdad exacta entre resultado, UI y WhatsApp.
3. Sustituye el sentinel de precio desconocido por un estado tipado explícito. Nunca trates un recargo desconocido como cero.
4. Cuando haya un cargo sin precio:
   - muestra “estimación parcial” o “requiere validación”;
   - enumera lo excluido;
   - evita presentar el total como definitivo;
   - conserva esta semántica en WhatsApp.
5. Valida cantidad con entero positivo seguro, límite de longitud y máximo comercial razonable. Si el máximo no existe en una fuente aprobada, centraliza un límite conservador y documenta que requiere aprobación.
6. Añade límites y normalización a nombre, ciudad, teléfono, email y comentarios. El destino de WhatsApp debe usar formato internacional verificable.
7. Impide doble clic, doble `window.open` y reaperturas durante el mismo intento.
8. Elimina o sustituye cualquier identificador fijo como `#001` que aparente trazabilidad inexistente.
9. Haz visible en móvil todo el desglose antes de enviar.
10. Aclara qué significa “desde” y evita que parezca incluir cargos que realmente no incluye.
11. Valida la configuración del número de WhatsApp en build o inicialización.
12. Configura encabezados de seguridad compatibles con Next.js y el despliegue, sin romper imágenes, fuentes ni WhatsApp.
13. Elimina la dependencia de fuentes remotas durante el build si esto no invade el rediseño visual; conserva las familias actuales mediante archivos locales autorizados o deja un informe de coordinación si el frontend paralelo es propietario de tipografía.
14. Ejecuta una actualización controlada de dependencias vulnerables:
    - consulta documentación y advisories vigentes;
    - no uses `npm audit fix --force`;
    - revisa cada cambio material;
    - repite pruebas y build.
15. Añade infraestructura de pruebas mantenible y scripts claros.

## Pruebas obligatorias

Cubre como mínimo:

- cantidades mínima, de tramo, cero, negativas, decimales, enormes y fuera de entero seguro;
- todos los modos de precio realmente soportados;
- cargos conocidos y cargos `requiresQuote`;
- redondeo e IVA;
- consistencia entre UI y WhatsApp;
- nombre/ciudad vacíos o espacios;
- teléfono y email inválidos;
- longitudes máximas;
- número de destino inválido;
- doble clic produce una sola apertura;
- URL codificada con tildes y saltos de línea;
- resumen móvil visible;
- destino WhatsApp interceptado, nunca real.

## Criterios de aceptación

- Ningún cargo desconocido se suma como cero silencioso.
- No se muestra un total definitivo si falta un precio.
- Ninguna cantidad fuera del rango seguro llega al cálculo.
- Dos clics rápidos generan exactamente una intención de apertura.
- El texto de WhatsApp coincide con el resultado mostrado.
- El móvil muestra el desglose completo.
- El build no depende de Google Fonts en tiempo de compilación, salvo bloqueo coordinado y documentado por el rediseño.
- No quedan vulnerabilidades altas/críticas explotables sin excepción documentada.
- Lint, TypeScript, pruebas y build pasan.
- No tocaste archivos del personalizador.

## Entrega

Revisa el diff completo y haz commits descriptivos. En tu respuesta final incluye:

1. hallazgos reproducidos;
2. decisiones de dominio;
3. archivos modificados;
4. pruebas y resultados;
5. vulnerabilidades restantes y justificación;
6. asuntos que requieren aprobación comercial;
7. instrucciones precisas para integración;
8. hash o hashes de commit.

