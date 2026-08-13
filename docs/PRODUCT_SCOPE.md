# Alcance técnico — Propagplast v1

## Resultado

La aplicación permite navegar productos, obtener una solicitud estimada y continuar en WhatsApp. Para llaveros y mouse pads, además permite crear una simulación visual local antes del envío.

## Incluido en estas ramas

### Cotizador y calidad

- Política monetaria y redondeo explícitos.
- Manejo honesto de cargos sin precio confirmado.
- Límites de cantidades y campos.
- Validación y normalización de contacto.
- Prevención de doble envío.
- Desglose visible en móvil.
- Mensaje de WhatsApp consistente con la UI.
- Validación del número de destino.
- Pruebas unitarias, de componente y E2E pertinentes.
- Actualización controlada de dependencias vulnerables.
- Fuentes locales y encabezados de seguridad si no entran en conflicto con el rediseño.

### Personalizador

- Habilitación exclusiva para slugs reales de llaveros y mouse pads.
- Carga local de PNG, JPEG y WebP.
- Posición, escala, rotación y restablecimiento.
- Recorte dentro del área imprimible.
- Previsualización responsive.
- Exportación a PNG.
- Manejo de memoria y errores.
- API de componente reutilizable para integración posterior.

## Fuera de alcance

- Base de datos, Supabase o backend de cotizaciones.
- Envío automático de archivos mediante `wa.me`.
- Almacenamiento permanente o temporal en nube.
- Panel administrativo, autenticación o CRM.
- Carrito multiproducto.
- Pagos en línea.
- Fidelidad fotográfica para superficies curvas sin mockup/máscara aprobados.
- Rediseño global, nueva marca, posts o redes sociales en estas ramas.

## Decisiones comerciales pendientes

El agente debe reportar, pero no inventar:

- tasa y aplicabilidad real del IVA;
- máximos comerciales por producto;
- precio y significado de cada adicional “por validar”;
- vigencia y beneficio del cupón LLAVERO;
- términos de la estimación;
- lista exacta de llaveros y mouse pads personalizables;
- mockup aprobado y área imprimible de cada referencia.

## Flujo final previsto

1. Usuario abre un producto.
2. Entra al cotizador.
3. Si el producto soporta personalización, aparece `ProductCustomizer`.
4. El usuario carga y ajusta su imagen.
5. El navegador produce y conserva temporalmente un `Blob` de previsualización.
6. El usuario completa la estimación.
7. Al enviar, la aplicación descarga la previsualización y abre WhatsApp una sola vez.
8. El mensaje indica que el usuario debe adjuntar el PNG descargado.

La integración de los pasos 3, 5, 7 y 8 se realiza después de mezclar las dos ramas.

