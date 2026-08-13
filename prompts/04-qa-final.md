# Prompt — QA final independiente

Audita `integration/propagplast-v1` después de integrar cotizador y personalizador. Comienza en modo de solo lectura. Delega en paralelo a subagentes independientes:

1. seguridad y privacidad;
2. cálculo, validación y WhatsApp;
3. personalizador, memoria y archivos;
4. responsive, accesibilidad y E2E.

Espera todos los resultados y consolida hallazgos sin duplicarlos. No edites código durante la primera pasada.

## Verificaciones

- comparación contra `AGENTS.md` y criterios de ambos prompts;
- `npm ci` reproducible;
- lint, TypeScript, pruebas y build;
- audit de dependencias con análisis de explotabilidad;
- cero requests con contenido de imágenes cargadas;
- carga/reemplazo/eliminación repetida sin fuga evidente de object URLs;
- PNG/JPEG/WebP y archivos inválidos;
- límites de tamaño y megapíxeles;
- recorte y exportación;
- todos los escenarios monetarios y cargos desconocidos;
- doble clic/reintento;
- destino WhatsApp interceptado;
- 320, 390, 768 y 1440 px;
- teclado, foco, labels, errores y contraste;
- headers de producción;
- consola y red limpias;
- ninguna regresión en las 16 rutas de producto existentes;
- ningún texto presenta una estimación como cotización formal;
- ningún cambio invade el rediseño frontend externo.

## Resultado

Entrega:

- dictamen listo/no listo;
- hallazgos P0–P3 con evidencia y reproducción;
- matriz de criterios aprobado/fallido/no comprobable;
- riesgos aceptables y bloqueantes;
- lista exacta de correcciones mínimas.

No corrijas nada hasta que el propietario autorice una segunda pasada de implementación.

