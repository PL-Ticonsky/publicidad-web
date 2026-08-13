# Política monetaria del generador de solicitudes

- La unidad interna es el peso colombiano (COP) entero; no se conservan fracciones ocultas.
- La única fuente técnica de la tasa de IVA es `IVA_RATE_BASIS_POINTS` en `money-policy.ts`.
- Se suman primero base, personalización y adicionales con precio confirmado.
- El IVA se calcula una sola vez sobre ese subtotal y se redondea al COP más cercano mediante `Math.round`.
- El total es exactamente `subtotal + IVA redondeado`.
- La UI y WhatsApp usan el mismo `QuoteResult` y el mismo presentador; no recalculan ni sustituyen importes ausentes por cero.
- Si existe un cargo `requiresQuote`, subtotal, IVA y total se identifican como parciales y el cargo excluido se enumera.
- Un producto `quote-only` no muestra total. El modo de producto `fixed` no se considera soportado hasta que exista una regla comercial aprobada.

Pendiente de aprobación comercial/fiscal: tasa y aplicabilidad del IVA, así como máximos de cantidad específicos por producto. Mientras se aprueban, el frontend usa un máximo preventivo centralizado de 100.000 unidades.
