# Especificación — Personalizador local

## Productos iniciales

El código debe descubrir los slugs reales en `src/data/products.ts`. No debe crear productos nuevos para satisfacer la especificación.

Una configuración de plantilla debe asociar cada slug soportado con:

- identificador estable;
- nombre visible;
- imagen base aprobada;
- capa superior o máscara, si existe;
- dimensiones internas del canvas;
- área imprimible expresada en coordenadas del canvas;
- forma de recorte;
- escala y posición iniciales;
- texto de limitación visual.

Ejemplo conceptual, no para copiar sin adaptarlo:

```ts
type MockupTemplate = {
  productSlug: string;
  canvas: { width: number; height: number };
  baseImageSrc: string;
  overlayImageSrc?: string;
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
};
```

## Seguridad del archivo

La extensión no es suficiente. Verifique el MIME declarado y que el navegador pueda decodificar realmente la imagen.

Rechace:

- formatos distintos de PNG, JPEG y WebP;
- archivos mayores de 10 MiB;
- imágenes que no se puedan decodificar;
- dimensiones nulas;
- imágenes mayores de 25 megapíxeles;
- SVG, PDF, PSD, ZIP y ejecutables.

Mensajes de error deben explicar cómo corregir el problema sin revelar detalles internos.

## Interacción

- Cargar o reemplazar imagen.
- Arrastrar con mouse y táctil.
- Zoom con control visible; gesto de pellizco es opcional si queda bien probado.
- Rotación con control visible.
- Botón de centrar/restablecer.
- Indicación permanente del área imprimible.
- Botón de eliminar imagen.
- Botón de descargar previsualización.
- Estados de archivo inválido, procesamiento, listo y error.
- Navegación mediante teclado y foco visible.

## Render

Orden previsto:

1. fondo transparente o aprobado;
2. mockup base;
3. diseño del usuario recortado al área imprimible;
4. sombras, brillos, bordes o capa superior;
5. marca visual de “simulación” solo en UI, no necesariamente en el archivo exportado según decisión de producto.

La exportación debe mantener una resolución suficiente y no capturar controles de interfaz.

## Manejo de memoria

- Revocar object URLs anteriores al reemplazar una imagen.
- Revocar URLs al desmontar cuando el contrato de propiedad lo permita.
- Evitar conservar canvas gigantes.
- No guardar data URLs en estado global si un `Blob` u object URL es suficiente.
- No imprimir nombres o contenido del archivo en logs de producción.

## Accesibilidad y responsive

- El área debe funcionar a 320 px sin overflow horizontal.
- Todos los controles deben tener nombre accesible.
- Los valores de escala y rotación deben poder modificarse sin drag.
- Los mensajes de error deben anunciarse apropiadamente.
- No depender exclusivamente del color para explicar el área imprimible.

## Pruebas mínimas

- producto soportado y no soportado;
- PNG/JPEG/WebP válido;
- MIME inválido;
- archivo demasiado grande;
- resolución excesiva;
- fallo de decodificación;
- reemplazo y eliminación;
- límites de traslación/escala/rotación;
- exportación con dimensiones correctas;
- recorte efectivo al área imprimible;
- limpieza de object URLs;
- teclado y controles visibles;
- render a 320, 390 y escritorio.

## Criterio de bloqueo por activos

Si faltan imágenes aprobadas, el agente puede terminar el motor, configuración, pruebas y una demostración inequívocamente marcada como fixture. No debe conectar una silueta inventada al catálogo de producción ni declarar completa la apariencia comercial.

