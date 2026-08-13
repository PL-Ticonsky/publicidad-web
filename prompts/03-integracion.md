# Prompt — integración de las dos ramas

Estás en `integration/propagplast-v1`. Las ramas `fix/cotizador-calidad` y `feat/personalizador-browser` ya fueron mezcladas y no hay otros agentes escribiendo en ellas.

Lee `AGENTS.md`, ambos prompts y los informes finales de las dos ramas. Inspecciona los commits y el diff de cada merge. No asumas que pasar pruebas por separado garantiza compatibilidad.

## Objetivo

Conectar el personalizador al flujo del cotizador sin introducir almacenamiento remoto, duplicar reglas ni deteriorar el rediseño frontend que se gestiona por separado.

## Integración esperada

1. Determine los slugs soportados usando la configuración exportada por el personalizador.
2. Para productos soportados, renderice `ProductCustomizer` dentro del flujo del cotizador, antes del envío.
3. Mantenga la previsualización únicamente en memoria mientras la página permanezca abierta.
4. No serialice el `Blob` en URL ni almacenamiento web.
5. Cuando exista una previsualización lista:
   - muestre nombre del archivo y estado;
   - permita descargarla antes de enviar;
   - en el envío, descargue o reutilice el PNG ya generado sin bloquear la apertura de WhatsApp;
   - añada al mensaje una línea inequívoca: se creó una previsualización y el usuario debe adjuntar el archivo descargado.
6. Si el usuario no personalizó, el cotizador debe funcionar exactamente como antes.
7. Un fallo de exportación no debe producir un mensaje que afirme que el archivo existe.
8. La descarga y WhatsApp no pueden ejecutarse dos veces por doble clic.
9. No convierta la previsualización en requisito para cotizar, salvo decisión comercial explícita.
10. Preserve toda corrección monetaria y de seguridad de la rama de calidad.

## Cuidado con ventanas emergentes

No introduzca una cadena asíncrona larga entre el clic y `window.open`. Genere el `Blob` previamente cuando la previsualización cambie o diseñe un flujo explícito de dos pasos. Verifique en navegador real que WhatsApp no sea bloqueado por el popup blocker.

## Pruebas de integración

- producto no personalizable;
- llavero soportado;
- mouse pad soportado;
- personalizador vacío;
- previsualización lista;
- exportación fallida;
- descarga única;
- apertura única de WhatsApp;
- mensaje con y sin arte;
- cambio entre archivos;
- móvil 320/390 px;
- navegación por teclado;
- recarga elimina la imagen local;
- ningún request contiene bytes o data URL del archivo.

## Terminado cuando

- lint, TypeScript, unitarias, integración, E2E y build pasan;
- no existen conflictos silenciosos entre contratos;
- no hay errores nuevos en consola;
- el flujo funciona en Chromium y en al menos un móvil real;
- el diff no incorpora rediseño visual global;
- existe un commit de integración con resumen de decisiones.

Entrega archivos modificados, pruebas ejecutadas, capturas o evidencia, riesgos restantes y hash del commit.

