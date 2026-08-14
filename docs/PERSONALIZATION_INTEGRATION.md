# Integración del personalizador

## Estado en memoria

`CustomizerPreviewProvider`, montado en el layout raíz, conserva la previsualización confirmada durante la navegación cliente desde `/producto/[slug]/personalizar` hasta `/cotizador`. No usa parámetros de URL, `localStorage`, `sessionStorage`, cookies ni red.

El personalizador conserva la propiedad de la `previewObjectUrl` que emite y la revoca al desmontarse. Al confirmar, el proveedor mantiene el mismo `Blob`, crea una object URL propia y revoca esa copia al reemplazarla o desmontarse. Una recarga crea un proveedor nuevo y elimina el estado.

El cotizador consume la previsualización únicamente cuando su `productSlug` coincide con el producto cotizado. La descarga es una acción manual protegida contra repetición; abrir WhatsApp no inicia otra descarga.

## Activos comerciales pendientes

Los slugs permitidos siguen proviniendo de `src/data/customizer/supported-products.ts`. En esta rama no existen mockups ni áreas imprimibles aprobados, por lo que `ProductCustomizer` muestra su bloqueo seguro y no se sustituyen esos activos por fixtures o ilustraciones del catálogo. La ruta y la transferencia al cotizador quedan preparadas para activarse cuando el motor exporte una previsualización comercial válida.
