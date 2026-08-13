# Auditoría técnica y funcional de TINTA

**Fecha de corte:** 11 de agosto de 2026  
**Repositorio:** `/home/ticonksy/publicidad-web`  
**Commit base observado:** `e627ca1` (`ArquitecturaSinDB`)  
**Rama:** `main`, alineada con `origin/main` al iniciar la auditoría  
**Alcance:** auditoría de solo lectura del código y de los entornos externos; el único archivo creado es este informe. No se enviaron mensajes, no se escribieron datos, no se ejecutaron migraciones y no se modificaron dependencias ni lockfiles.

## 1. Resumen ejecutivo

### Dictamen

TINTA es actualmente un **catálogo y generador de solicitudes estimadas, completamente frontend**, no la plataforma con Supabase y persistencia descrita en el contexto histórico. El recorrido local `landing → catálogo → detalle → cotizador → URL de WhatsApp` funciona para las 16 referencias y el build de producción pasa cuando dispone de red para descargar Google Fonts. Sin embargo, el recorrido original `cliente → cotización → cotizacion_items → WhatsApp` no existe en la versión actual: no hay SDK de Supabase, PostgreSQL, API, Server Action, Route Handler, tablas, migraciones ni escritura alguna.

**Valoración general: 54/100. No está listo para producción como MVP persistente.** Puede considerarse una demo comercial frontend funcional, con una promoción de llaveros independiente, pero no un sistema de registro de cotizaciones.

Resultados clave:

- Build: **pasa** con acceso a Google Fonts; sin red falla por tres fuentes remotas.
- Flujo frontend: **funciona** hasta construir e interceptar `https://wa.me/...`; no se contactó el destino.
- Flujo histórico completo: **no funciona de extremo a extremo**, porque cliente, cotización e ítems no se guardan.
- Cálculos: la fórmula base es coherente para cargos con precio conocido, pero es **parcial**: un recargo “por validar” vale cero en el total, no hay política explícita de redondeo y se aceptan enteros fuera del rango seguro.
- Persistencia: **no implementada**; no puede calificarse como consistente o atómica.
- WhatsApp: URL, codificación, tildes, saltos de línea y datos calculados **confirmados**; doble clic abre dos solicitudes.
- Seguridad de dependencias: `npm audit` reportó **6 paquetes con severidad alta**, incluido Next.js 16.2.10.
- Hallazgos: **P0: 0, P1: 3, P2: 13, P3: 9**.

Los cinco problemas principales son:

1. ausencia total de persistencia y del flujo Supabase esperado;
2. totales incompletos cuando se seleccionan recargos pendientes de validar;
3. dependencias con vulnerabilidades altas conocidas;
4. cantidades extremas y redondeo monetario sin una política segura;
5. validación exclusivamente cliente, envío duplicable y sin identidad verificable de cotización.

## 2. Estado general del proyecto

| Dimensión | Estado | Conclusión basada en evidencia |
|---|---|---|
| Catálogo | Confirmada | 16 productos activos locales; 16/16 detalles y cotizadores devolvieron HTTP 200. |
| Detalle | Confirmada | Navegación, 404, datos, técnica, precio base e imagen funcionan. |
| Cotizador | Parcial | Calcula localmente un solo producto; hay defectos con cargos desconocidos, límites y redondeo. |
| Formulario | Parcial | Valida nombre/ciudad, email y longitud mínima de teléfono en cliente; no hay backend. |
| Archivo gráfico | Parcial | Se selecciona en memoria, pero no se carga ni se refleja en el mensaje. |
| Registro de cliente | No implementada | El código declara explícitamente que no guarda ni envía los datos a servidor. |
| Guardado de cotización e ítems | No implementada | No existen cliente Supabase, consultas, API, acciones o esquema. |
| WhatsApp | Parcial | URL y mensaje correctos; no hay control de doble envío ni validación E.164 robusta. |
| Promoción de llaveros | Parcial | Splash accesible y cupón en WhatsApp; beneficio, vigencia y efecto en el cotizador no existen. |
| Responsive | Confirmada | Sin overflow horizontal a 1440, 390 y 320 px en las cuatro rutas principales. |
| Accesibilidad básica | Parcial | Labels, `lang`, alt y teclado correctos en muestra; desglose móvil oculto y textos demasiado pequeños. |
| Producción | No lista | Persistencia ausente, vulnerabilidades altas, privacidad/legal incompleta y cobertura automática inexistente. |

### Estado Git y conservación del trabajo del usuario

- Al inicio: `main...origin/main`, árbol limpio, sin cambios sin confirmar y sin archivos no rastreados.
- Durante la auditoría aparecieron cambios concurrentes ajenos a esta auditoría en:
  - `src/app/globals.css`;
  - `src/app/page.tsx`;
  - `src/app/producto/[slug]/page.tsx`;
  - `src/components/product-image.tsx`;
  - `src/components/product/product-gallery.tsx`;
  - `src/components/promotion/promotion-splash.tsx` y su módulo CSS, ambos nuevos.
- Esos cambios se conservaron y quedaron incluidos en las pruebas estables. Una edición intermedia produjo un fallo transitorio de TypeScript entre `priority` y `preload`; al estabilizarse los archivos, TypeScript, lint y build pasaron.
- Tras crear este documento, el único archivo nuevo de la auditoría es `AUDITORIA_TINTA.md`.

## 3. Stack y arquitectura encontrados

| Elemento esperado | Estado real | Evidencia |
|---|---|---|
| Next.js | Sí, 16.2.10 | `package.json:12`; App Router en `src/app/`. |
| React | Sí, 19.2.4 | `package.json:13-14`. |
| TypeScript | Sí, 5.9.3 instalado | `package.json:22`, `tsconfig.json`; modo `strict`. |
| Tailwind CSS | Sí, 4.3.2 instalado | `package.json:17,21`; `src/app/globals.css:1`. |
| Supabase | **No en el código actual** | No está en `package.json`; `src/lib/supabase.ts` fue eliminado en el commit actual. |
| PostgreSQL | **No** | No hay driver, ORM, URL usada, esquema ni migración. |
| WhatsApp | Sí, frontend | `src/lib/whatsapp/*`; `window.open` en `src/components/product-quote-calculator.tsx:127-148`. |

### Enrutamiento

Se usa **App Router**, confirmado por `src/app/layout.tsx`, archivos `page.tsx`, segmentos dinámicos y la salida de `next build`.

| Ruta | Tipo de render | Responsable |
|---|---|---|
| `/` | Estática | `src/app/page.tsx` |
| `/catalogo` | Estática | `src/app/catalogo/page.tsx` |
| `/catalogo/[categorySlug]` | SSG, 5 rutas | `src/app/catalogo/[categorySlug]/page.tsx` |
| `/producto/[slug]` | SSG, 16 rutas | `src/app/producto/[slug]/page.tsx` |
| `/cotizador?producto=...` | Dinámica por `searchParams` | `src/app/cotizador/page.tsx` |
| API/Route Handlers | Ninguno | No existe `route.ts`. |
| Server Actions | Ninguna | No existe `"use server"`. |

### Organización real de la lógica

- Catálogo y precios: arreglos TypeScript en `src/data/products.ts`, `categories.ts`, `techniques.ts` y `additionals.ts`.
- Integridad de catálogo: `src/data/validate-catalog.ts`; se ejecuta durante la generación estática de productos.
- Reglas de negocio: funciones puras en `src/lib/quotation/`.
- Formato COP: `src/lib/format.ts`.
- WhatsApp: `src/lib/whatsapp/build-whatsapp-message.ts` y `build-whatsapp-url.ts`.
- Promoción: `src/components/promotion/promotion-splash.tsx`, conectada desde `src/app/page.tsx:17-49`; conserva solo un flag de sesión en `sessionStorage`.
- Estado, validación del contacto, envío y archivo: componente cliente de 360 líneas, `src/components/product-quote-calculator.tsx`.
- Servidor: renderiza páginas y datos locales; no valida solicitudes ni persiste.
- Cliente: calcula, valida, construye el mensaje, emite analítica local y abre WhatsApp.

### Variables de entorno

- La única variable consumida por el código es `NEXT_PUBLIC_WHATSAPP_NUMBER` (`src/components/product-quote-calculator.tsx:135` y layout/landing).
- `.env.example` documenta únicamente esa variable.
- `.env.local`, ignorado por Git, contiene además nombres de variables públicas heredadas de Supabase y apunta a un endpoint remoto o personalizado. No se muestran sus valores.
- Se comprobó el bundle: los valores Supabase **no están** en `.next/static`; el número de WhatsApp sí está, lo cual es esperable para una variable pública y una operación cliente.
- No se encontró `service_role`, clave privada, URL PostgreSQL ni `DATABASE_URL` en `HEAD`.

### Gestor, scripts, pruebas y despliegue

- Gestor: npm, `package-lock.json`, lockfile reproducible; Node instalado 26.7.0 y Next exige `>=20.9.0`.
- Scripts disponibles: `dev`, `build`, `start`, `lint` (`package.json:5-10`).
- No hay scripts `test`, `typecheck`, `audit` ni validación específica de catálogo.
- No hay Jest, Vitest, Playwright de proyecto, Cypress, tests unitarios o de integración.
- No hay CI, `vercel.json`, Dockerfile ni configuración específica de despliegue.
- `next.config.ts:3` está vacío.

## 4. Mapa del flujo completo

```text
/ o /catalogo
  ├─ promoción llavero → WhatsApp informativo               src/app/page.tsx:17-49
  │  └─ splash + flag de sesión                             src/components/promotion/promotion-splash.tsx:21-207
  └─ datos locales getAllActiveProducts()                   src/data/products.ts:340-353
     └─ ProductCard → /producto/[slug]                      src/components/product-card.tsx:8-19
        └─ getProductBySlug() + técnicas/adicionales        src/app/producto/[slug]/page.tsx:33-43
           └─ /cotizador?producto=[slug]                    src/app/producto/[slug]/page.tsx:108-110
              └─ ProductQuoteCalculator (cliente)           src/app/cotizador/page.tsx:38-45
                 ├─ validateQuotation()                     src/lib/quotation/validate-quotation.ts:5-28
                 ├─ calculateQuote()                        src/lib/quotation/calculate-quote.ts:16-76
                 ├─ contactErrors()                         src/components/product-quote-calculator.tsx:38-48
                 ├─ buildWhatsAppMessage()                  src/lib/whatsapp/build-whatsapp-message.ts:8-45
                 ├─ buildWhatsAppUrl() + encodeURIComponent src/lib/whatsapp/build-whatsapp-url.ts:5-8
                 └─ window.open(..., noopener,noreferrer)   src/components/product-quote-calculator.tsx:135-148
```

Pasos del flujo histórico y estado actual:

1. Consultar catálogo desde Supabase: **reemplazado por datos estáticos locales**.
2. Mostrar detalle: **implementado**.
3. Configurar un producto: **implementado para un solo producto**.
4. Calcular subtotal, IVA y total: **implementado localmente, con salvedades**.
5. Registrar cliente: **no implementado**; solo se incorpora al texto.
6. Guardar cotización: **no implementado**.
7. Guardar `cotizacion_items`: **no implementado**.
8. Construir mensaje: **implementado**.
9. Redirigir a WhatsApp: **implementado con pestaña nueva**.

No existe carrito ni cotización multiproducto. El comportamiento real sigue siendo de un producto por solicitud.

## 5. Matriz de funcionalidades

| Funcionalidad | Estado | Prueba realizada | Evidencia | Observaciones |
|---|---|---|---|---|
| Landing | Confirmada | Navegación real producción y desarrollo | HTTP 200, H1 correcto, sin consola de producción | CTA y enlaces operativos. |
| Catálogo real | Confirmada como local | Playwright contó 16 tarjetas | `products.ts`; 16/16 rutas | No proviene de Supabase. |
| Estado de carga del catálogo | No implementada / no aplicable | Inspección | No hay fetch ni `loading.tsx` | Render estático inmediato. |
| Estado vacío | Parcial | Inspección, no alteración de datos | `catalogo/page.tsx:30-37` | Existe UI condicional, inalcanzable con catálogo actual sin cambiar código. |
| Error de conexión | No aplicable | Red y código | No hay conexión de catálogo | No existe error boundary específico. |
| Producto sin imagen | Confirmada | Se abortaron 2 recursos de imagen | Apareció “Fotografía pendiente” con `role=img` | Build también verifica rutas locales. |
| Filtros/búsqueda/orden | No implementada | DOM e inspección | Solo grid en `catalogo/page.tsx:29-38` | README afirma que existen. |
| Detalle válido | Confirmada | 16/16 productos | HTTP 200, H1, CTA y total inicial | Recarga directa confirmada. |
| Producto/categoría inexistente | Confirmada | Rutas ficticias | HTTP 404 en ambas | Producto tiene 404 específico. |
| Técnicas y adicionales | Confirmada | Selección real | Recalcula inmediatamente | No hay talla, color, material o distribución. |
| Formulario obligatorio | Confirmada | Nombre/ciudad vacíos y espacios | Botón deshabilitado | Campos opcionales presentan validación débil. |
| Email inválido | Confirmada | `correo-invalido` | Mensaje visible, submit deshabilitado | Solo regex cliente. |
| Teléfono inválido corto | Confirmada | `123` | Mensaje visible | Texto con letras y ≥7 dígitos fue aceptado. |
| Archivo gráfico | Parcial | Inspección y UI | Solo estado `File` local | No se carga ni se menciona como seleccionado en WhatsApp. |
| Cálculo con cantidad mínima | Confirmada | Camiseta, 20 | Total mostrado $898.450 | Fórmula reproducible abajo. |
| Varias unidades/tramo | Confirmada | Camiseta, 50 | Total $1.993.250 | Se aplicó tramo 50–99. |
| Cero, negativo, decimal, vacío | Confirmada como rechazados | Valores `0`, `-1`, `1.5`, vacío | Error de entero positivo | Vacío se convierte a `0`. |
| Caracteres no numéricos | Confirmada por control HTML | Intento `abc` | `input[type=number]` lo rechazó | No llegó al estado React. |
| Cantidad extremadamente grande | Rota | 24 dígitos | Fue aceptada y mostró valor impreciso | No hay máximo ni `MAX_SAFE_INTEGER`. |
| Precio cero | No comprobable como base | Inspección | Integridad rechaza tier `<=0` | Sí hay adicionales de precio 0 pendientes. |
| Recargo pendiente | Rota | “Entrega urgente” seleccionada | Total no cambió | Mensaje sí enumera el adicional. |
| Doble envío | Rota | Doble clic interceptado | 2 llamadas a `window.open` | No hay estado `submitting`. |
| Persistencia cliente/cotización/ítems | No implementada | Búsqueda y red | Cero solicitudes Supabase/API | UI lo declara expresamente. |
| Mensaje WhatsApp | Confirmada | URL interceptada y decodificada | Datos y totales coincidieron | Sin ID de cotización ni archivo. |
| Caracteres especiales | Confirmada | Tildes, `&`, `%`, `+`, salto de línea | Decodificación exacta; sin espacios crudos | Usa `encodeURIComponent`. |
| Responsive | Confirmada | 1440, 390, 320 px | Sin overflow | En móvil se oculta el desglose. |
| Teclado/labels/alt | Confirmada en prueba básica | Menú con Enter; auditoría DOM | 20/20 controles con nombre; 0 imágenes sin alt | No se midió contraste con herramienta dedicada. |
| Analítica | Parcial/simulada | Inspección | `CustomEvent` y `dataLayer?` | No hay proveedor o consumidor configurado. |
| Promoción/cupón LLAVERO | Parcial | Playwright, nueva sesión y URL interceptada | Dialog visible, foco correcto, mensaje con cupón | No define descuento/vigencia ni se transporta al cotizador. |

## 6. Resultados de ejecución técnica

| Comando exacto | Resultado | Errores / advertencias | Archivos afectados / causa | ¿Bloquea despliegue? |
|---|---|---|---|---|
| `npm ci` | Éxito; 357 paquetes | 0 errores; 1 bloque de warning, 2 scripts bloqueados | `sharp@0.34.5`, `unrs-resolver@1.12.2`; política `allowScripts` de npm 12 | No en esta máquina: build pasó. Debe fijarse en CI. |
| `npm run lint` | Éxito | 0 / 0 | Todo `src` | No. |
| `npx tsc --noEmit` | Falló una vez durante edición concurrente; reintento estable exitoso | Inicial 1 error TS2322; final 0 / 0 | `src/app/page.tsx`, prop transitoria `priority` vs `preload` | No en el estado final; sí habría bloqueado durante la edición intermedia. |
| `npm run build` (sandbox sin red) | Fallo | 3 warnings y 3 errores | Descarga de Bodoni Moda, Hanken Grotesk y JetBrains Mono | Sí en entornos sin salida a Google Fonts. |
| `npm run build` (red autorizada) | Éxito | 0 errores finales | 27 páginas; 5 categorías, 16 productos | No. |
| `npm run` | Éxito | Sin `test` ni `typecheck` | `package.json` | La falta de tests sí es riesgo de release. |
| `npm audit --json` | Reporte con salida no cero | 6 altas, 0 críticas/moderadas/bajas según resumen npm | Next, sharp, postcss, brace-expansion, js-yaml, nanoid | Sí para un gate de seguridad razonable. |
| `npm outdated` | 11 filas | Next 16.3.0 y React 19.2.8 disponibles, entre otras | Solo consulta; nada se actualizó | No por sí solo; Next tiene fixes de seguridad. |
| `npm install-scripts ls` | Éxito | 2 scripts bloqueados | sharp, unrs-resolver | Riesgo de reproducibilidad. |
| `npm start -- --hostname 127.0.0.1 -p 3017` | Éxito fuera del sandbox | 0 | Servidor de producción local | No. |
| Harness inline con Playwright/Chromium | Éxito | 16/16 referencias, 0 fallos de página, 0 errores de consola de producción | Browser descargado en caché; no se añadió dependencia | No. |

### Consola y red

- Producción: sin errores de consola, sin `pageerror`, sin hidratación fallida y sin respuestas HTTP ≥400 durante el flujo válido.
- Hubo cancelaciones `ERR_ABORTED` de prefetch RSC al navegar rápidamente; no fueron fallos de recurso ni respuestas de error.
- Desarrollo preexistente en `localhost:3000`: páginas y cálculo funcionaron, sin `pageerror`, pero el acceso por `127.0.0.1` produjo dos fallos WebSocket HMR y un warning de `allowedDevOrigins`.
- El log de desarrollo también registra el warning de Next por `scroll-behavior: smooth` sin `data-scroll-behavior="smooth"`.
- No hubo solicitudes a Supabase, PostgreSQL, API propia o servicio de analítica.
- Los 404 de producto y categoría inexistentes devuelven correctamente 404, no una página 200 disfrazada.

### Diferencias desarrollo/producción

- Producción no mostró errores ni warnings de navegador.
- Desarrollo mostró únicamente problemas de HMR/origen por usar `127.0.0.1` frente al host de la instancia existente y el warning de scroll suave.
- El build requiere red en su configuración actual por `next/font/google`; una vez construido, las fuentes quedaron autoalojadas en `.next/static/media`.

## 7. Auditoría del cálculo de la cotización

### Fuente de verdad actual

La única fuente de verdad es cliente y está centralizada en `calculateQuote`:

```text
precio base unitario = precio del tramo por cantidad
costo base = precio base unitario × cantidad
costo técnica = precio técnica por unidad × cantidad + preparación/fijo
costo adicionales = suma(per-unit × cantidad) + suma(fijos)
subtotal = costo base + costo técnica + costo adicionales
IVA = subtotal × 0,19
total estimado = subtotal + IVA
```

No existen descuentos ni costo de entrega. El IVA está fijado en código a **19 %** en `src/lib/quotation/calculate-quote.ts:7`, no proviene de configuración ni base de datos. La UI y WhatsApp repiten el texto “19 %” en `product-quote-calculator.tsx:325` y `build-whatsapp-message.ts:16`.

### Ejemplos reproducibles

**Camiseta, 20 unidades, DTF, sin adicionales**

```text
base              = 32.000 × 20                 = 640.000
técnica DTF       = 4.500 × 20 + 25.000         = 115.000
subtotal          = 640.000 + 115.000           = 755.000
IVA               = 755.000 × 0,19              = 143.450
total             = 755.000 + 143.450           = 898.450
```

La UI produjo `$ 898.450`.

**Camiseta, 50 unidades, DTF y diseño básico**

```text
base              = 28.500 × 50                 = 1.425.000
técnica DTF       = 4.500 × 50 + 25.000         =   250.000
diseño básico     = fijo                         =    30.000
subtotal          = 1.425.000 + 250.000 + 30.000= 1.705.000
IVA               = 1.705.000 × 0,19            =   323.950
total             = 1.705.000 + 323.950          = 2.028.950
```

UI y mensaje interceptado coincidieron en `$ 2.028.950`.

### Redondeo y precisión

Los precios del catálogo son enteros COP, pero el motor usa `number` y no redondea. Ejemplo real:

```text
Libreta, 25 unidades:
base              = 22.000 × 25                 = 550.000
tampografía       = 250 × 25 + 25.000            = 31.250
subtotal                                           581.250
IVA exacto        = 581.250 × 0,19              = 110.437,5
total exacto                                       691.687,5
valor mostrado por Intl.NumberFormat              691.688
```

La UI y WhatsApp redondean visualmente a cero decimales por `formatCOP`, pero el valor interno conserva `0,5`. No hay regla documentada que determine si se redondea IVA, cada línea o solo el total. Si se reintroduce persistencia, esta ambigüedad puede separar valor mostrado y valor guardado.

Para COP y este catálogo conviene usar enteros en la mínima unidad comercial acordada o una librería decimal, aplicar una política explícita por línea y persistir los valores ya normalizados. También debe rechazarse cualquier cantidad no segura con `Number.isSafeInteger` y un máximo comercial.

### Naturaleza del documento

TINTA **no genera una factura ni una cotización comercial formal**. Genera una **solicitud de cotización aproximada** en el navegador y la envía como texto a WhatsApp. No hay numeración real, emisión, almacenamiento, aceptación, vigencia, condiciones, identificación fiscal o documento descargable. Los propios textos “borrador local”, “estimado” y “puede variar” lo confirman (`product-quote-calculator.tsx:158-161,332`).

## 8. Auditoría de Supabase y persistencia

### Hechos comprobados

- No existe dependencia Supabase, cliente, servicio, Route Handler, Server Action, SQL, migración o esquema en el árbol actual.
- No existen definiciones actuales de `clientes`, `cotizaciones`, `cotizacion_items`, `productos` o relaciones.
- No hay inserciones; por tanto, no existen orden de inserción, manejo de fallo intermedio, idempotencia, estados, timestamps ni transacción que auditar.
- `README.md:5` y la UI (`product-quote-calculator.tsx:161,285,304`) afirman explícitamente que no se guarda nada.
- El historial muestra una rama/commit anterior con `src/lib/supabase.ts`; el commit actual `ArquitecturaSinDB` lo eliminó. No se trató ese código histórico como implementación vigente.
- `.env.local` tiene variables públicas heredadas y endpoint remoto, pero el código no las consume y sus valores no quedaron en el bundle.

### Atomicidad requerida

Si el MVP vuelve a requerir cliente, cotización e ítems, las tres escrituras **deben ser una sola operación atómica**, preferiblemente una función SQL/RPC o una transacción controlada en servidor. Debe incluir:

- validación de catálogo y precios contra una fuente de servidor;
- clave idempotente por intento;
- creación o resolución del cliente;
- cabecera de cotización;
- uno o varios ítems;
- subtotal, impuesto, cargos, descuentos y total normalizados;
- rollback completo ante cualquier error;
- respuesta con ID público no secuencial;
- apertura de WhatsApp solo después de confirmar commit.

### Seguridad Supabase y RLS

**No comprobable en el estado actual.** El endpoint local configurado es remoto o personalizado y no fue posible demostrar que sea prueba. Por la restricción de no escribir ni exponer datos, no se hicieron consultas a tablas ni pruebas de políticas.

No se puede afirmar:

- si las tablas existen;
- si RLS está habilitado;
- cuáles son las políticas efectivas de `anon` o `authenticated`;
- si hay `SELECT` público sobre datos personales;
- qué tipos monetarios, claves foráneas o restricciones existen.

Sí se comprobó que el `service_role` no aparece en `HEAD` y que las variables Supabase locales no se incluyeron en el JavaScript estático. Antes de reactivar persistencia se necesita un entorno aislado, el esquema exportado y una matriz de pruebas de políticas con datos ficticios.

## 9. Auditoría de WhatsApp

### Trazabilidad

1. Submit síncrono en `product-quote-calculator.tsx:112-149`.
2. Validación de configuración y contacto.
3. Construcción de texto en `build-whatsapp-message.ts:8-45`.
4. Normalización del destino eliminando no dígitos y construcción `wa.me` en `build-whatsapp-url.ts:1-8`.
5. Codificación completa con `encodeURIComponent`.
6. Apertura `_blank` con `noopener,noreferrer`.

### Resultados

- Destino configurado: 12 dígitos y prefijo de país 57; no se expone aquí el número.
- Origen: `NEXT_PUBLIC_WHATSAPP_NUMBER`, embebido al construir el frontend.
- Host: `wa.me`; protocolo HTTPS.
- Tildes, `&`, `%`, `+`, símbolos monetarios y saltos de línea: preservados al decodificar.
- Espacios crudos en URL: ninguno.
- Datos opcionales vacíos: sustituidos por “No indicado”, “Sin comentarios” o “Sin observaciones”.
- Apertura: síncrona después del cálculo; no hay guardado que esperar.
- Móvil/escritorio: se usa pestaña nueva en ambos; no se verificó la app nativa de WhatsApp porque no se abandonó localhost.
- Doble clic: produjo 2 aperturas interceptadas.
- Texto de 5.000 caracteres: produjo una URL de 5.950 caracteres y se intentó abrir; no existe límite preventivo.
- No hay ID de cotización ni indicación de archivo seleccionado.

### Ejemplo anonimizado interceptado

```text
Hola, deseo solicitar una cotización.

DATOS DEL CLIENTE
Nombre: Cliente de prueba
Empresa: No indicado
Ciudad: Bogotá
Teléfono: [teléfono ficticio]
Email: auditoria@example.test

PRODUCTO
Producto: Camiseta corporativa personalizada
Cantidad: 50
Técnica: DTF
Adicionales: Diseño básico, Entrega urgente

ESTIMACIÓN
Precio estimado por unidad: $ 34.100
Subtotal estimado: $ 1.705.000
IVA estimado (19%): $ 323.950
Total estimado: $ 2.028.950

COMENTARIOS
Sin comentarios
Observaciones del diseño: Sin observaciones

El valor final puede variar según el diseño, técnica de personalización,
materiales, disponibilidad, urgencia y condiciones de entrega.
```

El mensaje coincide con lo mostrado, pero el total no incluye ningún valor por “Entrega urgente”, aunque la opción aparece seleccionada.

## 10. Interfaz, responsive y accesibilidad

### Confirmado

- Viewports 1440×900, 390×844 y 320×700: sin desbordamiento horizontal en landing, catálogo, detalle y cotizador.
- Menú móvil se abre con foco + Enter y expone 6 enlaces.
- `lang="es"` presente.
- En el cotizador probado, 20 controles tenían nombre accesible; no hubo controles sin label.
- Ninguna imagen renderizada carecía de atributo alt.
- El fallback de imagen rota tiene `role="img"`, etiqueta accesible y texto visible.
- Nombre y ciudad con espacios no habilitan envío.
- Campos usan `type=number`, `tel` y `email`, útil para teclado móvil.
- El botón móvil fijo respeta `safe-area-inset-bottom`.
- El splash promocional se mostró una vez por sesión, enfocó el CTA, encerró el foco, bloqueó scroll, cerró con Escape, restauró el foco y no reapareció al recargar la misma sesión.

### Parcial o pendiente

- En móvil el panel completo de subtotal, IVA, técnica y adicionales está oculto (`product-quote-calculator.tsx:312`); solo queda el total fijo (`:297-301`).
- Muchos textos técnicos usan 8–10 px, por debajo de una legibilidad cómoda.
- No existe confirmación interna: la única consecuencia es abrir WhatsApp.
- No hay estado “enviando” ni prevención de doble clic.
- No se ejecutó un medidor automático WCAG de contraste; la revisión fue DOM, teclado y visual funcional.
- No se probó lector de pantalla real, VoiceOver/TalkBack ni teclado móvil físico.
- No se tomaron capturas porque las métricas y el DOM reprodujeron los problemas sin necesidad de evidencia visual adicional.

## 11. Seguridad

### Aspectos favorables comprobados

- No hay secretos privados ni `service_role` en el código vigente.
- Las variables Supabase heredadas no se incluyen en el bundle.
- El teléfono público sí se incluye, coherente con el diseño cliente.
- WhatsApp usa host fijo HTTPS y codificación; no hay redirección abierta controlada por parámetro de usuario.
- React escapa los datos del formulario; el JSON-LD reemplaza `<` por `\u003c` (`producto/[slug]/page.tsx:60`).
- `window.open` usa `noopener,noreferrer`.
- No hay logs de PII ni almacenamiento local.

### Riesgos

- `npm audit`: 6 vulnerabilidades altas; Next 16.2.10 está dentro de rangos afectados por advisories de bypass/DoS/SSRF/cache/disclosure. Varias rutas de explotación no se usan en este proyecto (no hay Actions, proxy o custom server), pero el framework y optimizador de imágenes sí están desplegados.
- Sin backend, cualquier mensaje/precio es editable por el usuario y carece de firma o ID verificable. Un asesor no debe tratar el texto como cotización emitida.
- Encabezados locales: no se observaron CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` ni protección de framing; sí se expone `X-Powered-By: Next.js`. HSTS puede depender del proxy y no se puede concluir desde HTTP local.
- Los datos personales se colocan en el query string dirigido a WhatsApp. Es funcionalmente necesario para `wa.me`, pero requiere aviso/consentimiento y minimización.
- No existe política de privacidad, tratamiento de datos o identificación empresarial publicada; el footer dice “Información empresarial pendiente de publicación”.
- No hay rate limiting: no existe servidor propio. El doble clic puede abrir múltiples pestañas, aunque no duplica registros porque no hay registros.
- No hay CORS custom; por tanto no se detectó una configuración insegura de CORS en la app.

## 12. Rendimiento y mantenibilidad

### Rendimiento

- Las páginas de catálogo/detalle son estáticas o SSG y no tienen latencia de base de datos.
- Se usa `next/image`, fuentes autoalojadas tras build y `sizes` responsivos.
- HTML de producción medido: landing 71.681 bytes; catálogo 103.647 bytes sin compresión. Es razonable para 16 productos, aunque el catálogo embebe bastante contenido.
- El componente cliente de cotización concentra 360 líneas y toda la lógica interactiva; el cálculo puro está bien separado.
- No hay fetch repetido, consultas N+1 ni caché de datos remotos porque no hay datos remotos.

### Mantenibilidad

- Puntos positivos: TypeScript estricto, cero `any` encontrado, reglas puras separadas, integridad de referencias/imágenes en build y formato monetario centralizado.
- Deuda: sin schemas de validación compartidos cliente/servidor, sin tests, sin límites numéricos, IVA repetido en tres lugares, modos tipados no cubiertos y documentación desalineada.
- `tokens.css:16-25` duplica cinco variables; usa sombras no definidas desde `product-card.tsx:14`.
- CSS para `#nombre`, `#empresa`, `#telefono`, `#ciudad` no coincide con IDs reales `name`, `company`, `phone`, `city`.
- `Skeleton`, `Select` y varios iconos se exportan sin uso.
- La analítica solo emite eventos opcionales; no hay integración que los consuma o confirme entrega.

## 13. Hallazgos priorizados P0–P3

### Tabla resumida

| ID | Severidad | Área | Estado | Evidencia | Impacto | Recomendación |
|---|---|---|---|---|---|---|
| TINTA-001 | P1 | Persistencia | No implementada | README:5; cotizador:161,285,304; cero API/Supabase | Flujo histórico principal inexistente | Backend + transacción atómica + RLS |
| TINTA-002 | P1 | Cálculo | Rota | additionals.ts:5,10; prueba total sin cambio | Total puede omitir recargo seleccionado | Bloquear total o excluir/marcar explícitamente |
| TINTA-003 | P1 | Dependencias | Rota | `npm audit`: 6 altas | Vulnerabilidades conocidas | Actualización controlada y retest |
| TINTA-004 | P2 | Cálculo | Rota | validate:8; cantidad de 24 dígitos aceptada | Pérdida de precisión / importes absurdos | `isSafeInteger` y máximo |
| TINTA-005 | P2 | Dinero | Parcial | calculate:58,73; format:1-8 | Valor interno y mostrado pueden diferir | Política decimal/redondeo explícita |
| TINTA-006 | P2 | Envío | Rota | cotizador:112-149; 2 aperturas | Solicitudes/pestañas duplicadas | Estado in-flight y debounce/idempotencia |
| TINTA-007 | P2 | Validación | Parcial | cotizador:38-48; URL 5.950 caracteres | Datos inválidos, texto excesivo, sin autenticidad | Schema compartido, límites y servidor |
| TINTA-008 | P2 | Producto | Parcial | product.ts:45-60; products.ts | Cotización sin variables comerciales críticas | Modelar variantes/especificaciones |
| TINTA-009 | P2 | Precios UX | Parcial | product-card:11-18; detail:41-43 | “Desde” excluye técnica, setup e IVA | Etiquetar base o mostrar escenario completo |
| TINTA-010 | P2 | Identidad | Rota | cotizador:158,167 | `#001` se repite y no identifica nada | Eliminar o usar ID real |
| TINTA-011 | P2 | Archivo | Parcial | cotizador:65,256-265 | UI no conecta archivo con solicitud | Upload seguro o estado explícito en mensaje |
| TINTA-012 | P2 | Privacidad/legal | No implementada | cotizador:285,304; footer:7 | Riesgo de confianza y tratamiento de PII | Aviso, consentimiento e identidad empresarial |
| TINTA-013 | P2 | Headers | Parcial | next.config.ts:3; headers HTTP | Defensa en profundidad ausente | CSP y encabezados en app/proxy |
| TINTA-014 | P2 | Calidad | No implementada | package.json:5-10 | Regresiones de cálculo no detectadas | Unit, integración y E2E en CI |
| TINTA-015 | P2 | UX móvil | Parcial | cotizador:297-325 | Móvil no ve desglose antes de enviar | Resumen colapsable/visible |
| TINTA-025 | P2 | Promoción | Parcial | page:17-49; promotion-splash:136-177 | Cupón sin beneficio, vigencia ni efecto de precio | Definir campaña y conectarla al cotizador |
| TINTA-016 | P3 | Documentación | Rota | README:12 vs catálogo:29-38 | Expectativas falsas | Corregir README o implementar controles |
| TINTA-017 | P3 | Arquitectura | Parcial | product.ts:1; calculate:20,38 | `fixed` no tiene camino propio | Implementar/eliminar modo y probarlo |
| TINTA-018 | P3 | Analítica | Simulada | analytics.ts:3-7 | Eventos sin observabilidad real | Integrar proveedor/consentimiento o retirar |
| TINTA-019 | P3 | CSS/código muerto | Parcial | tokens:16-25; globals:35 | Inconsistencia y estilos inefectivos | Limpiar tokens, IDs y exports |
| TINTA-020 | P3 | Desarrollo | Parcial | log dev; globals:11 | HMR warning y warning de navegación | Host/origen coherente y atributo requerido |
| TINTA-021 | P3 | Build | Parcial | build sin red; npm scripts | CI depende de red y política npm | Fuentes locales y allowScripts explícito |
| TINTA-022 | P3 | SEO | Parcial | layout:25-30; ausencia robots/sitemap | Descubrimiento y sharing incompletos | metadataBase, canonical, robots, sitemap, OG |
| TINTA-023 | P3 | WhatsApp | Parcial | build-whatsapp-url:1-8 | Cualquier secuencia de dígitos se acepta | Validar E.164 y país esperado |
| TINTA-024 | P3 | Legibilidad | Parcial | múltiples clases `text-[8px]`/`9px` | Lectura difícil y accesibilidad | Mínimos tipográficos y test visual |

### Detalle de hallazgos

#### TINTA-001 — Persistencia y flujo Supabase ausentes

- **Severidad / categoría / funcionalidad / estado:** P1 / funcional-persistencia / registro y guardado / no implementada.
- **Archivo y línea:** `README.md:5`; `src/components/product-quote-calculator.tsx:161,285,304`; `package.json:11-22`.
- **Evidencia observada:** hecho comprobado. No existe dependencia, cliente, tabla, API, acción o request de red; el texto afirma “Nada se guarda”.
- **Reproducción:** completar el cotizador y enviar con `window.open` interceptado; inspeccionar red y repositorio.
- **Esperado / obtenido:** crear cliente, cotización e ítems antes de WhatsApp / solo se construye una URL.
- **Impacto:** el flujo principal histórico, auditoría comercial, recuperación y trazabilidad no existen.
- **Causa probable:** decisión explícita del commit `ArquitecturaSinDB` de convertir el producto en frontend local.
- **Recomendación / esfuerzo / confianza:** restablecer arquitectura servidor y transacción atómica con idempotencia; **XL (1–3 semanas)**; confianza **alta**.

#### TINTA-002 — Recargo desconocido produce un total incompleto

- **Severidad / categoría / funcionalidad / estado:** P1 / cálculo / adicionales / rota.
- **Archivo y línea:** `src/data/additionals.ts:5,10`; `src/lib/quotation/calculate-quote.ts:50-58`; `src/components/product-quote-calculator.tsx:242-245`.
- **Evidencia observada:** hecho comprobado. “Entrega urgente” se muestra “Por validar”, cuesta 0, el total permanece $2.028.950 y WhatsApp enumera el adicional sin decir que está excluido.
- **Reproducción:** camiseta, 50, DTF, diseño básico; anotar total; seleccionar entrega urgente; enviar/interceptar.
- **Esperado / obtenido:** impedir un total completo o señalar su exclusión / total aparentemente completo sin recargo.
- **Impacto:** expectativa de precio incorrecta y conflicto comercial.
- **Causa probable:** usar cero como sentinel de “desconocido”.
- **Recomendación / esfuerzo / confianza:** representar precio desconocido con estado explícito; devolver `quote-only` o total parcial con líneas excluidas; **M (1–3 días)**; **alta**.

#### TINTA-003 — Seis dependencias con vulnerabilidad alta

- **Severidad / categoría / funcionalidad / estado:** P1 / seguridad de cadena de suministro / runtime y build / rota.
- **Archivo y línea:** `package.json:12,18`; entradas resueltas en `package-lock.json`.
- **Evidencia observada:** hecho comprobado por `npm audit --json`: Next, sharp, postcss, brace-expansion, js-yaml y nanoid; cero críticas.
- **Reproducción:** `npm ci && npm audit --json` con acceso al registro.
- **Esperado / obtenido:** release sin altas / 6 paquetes afectados; Next 16.3.0 ofrecido como fix.
- **Impacto:** exposición potencial a DoS, bypass, SSRF, disclosure y fallos de procesamiento. La explotabilidad varía y varias funciones afectadas no se usan.
- **Causa probable:** versiones fijadas anteriores a advisories publicados.
- **Recomendación / esfuerzo / confianza:** actualizar en rama separada, leer guías Next 16, revisar lock y repetir E2E; **M (1–3 días)**; confianza en presencia **alta**, en explotabilidad **media**.

#### TINTA-004 — Cantidad fuera del entero seguro aceptada

- **Severidad / categoría / funcionalidad / estado:** P2 / validación-cálculo / cantidad / rota.
- **Archivo y línea:** `validate-quotation.ts:8-11`; input en `product-quote-calculator.tsx:192-195`.
- **Evidencia observada:** hecho comprobado. `999999999999999999999999` pasó la validación y mostró `$ 35.104.999.999.999.994.000.000.000.000`.
- **Reproducción:** introducir el valor anterior con nombre/ciudad válidos.
- **Esperado / obtenido:** rechazo por máximo/rango seguro / cálculo con precisión perdida.
- **Impacto:** mensajes absurdos, consumo innecesario y cálculo no confiable.
- **Causa probable:** `Number.isInteger` sin `Number.isSafeInteger` ni máximo.
- **Recomendación / esfuerzo / confianza:** máximo por producto, safe integer, límites de longitud y validación server-side futura; **S (<1 día)**; **alta**.

#### TINTA-005 — Redondeo monetario implícito

- **Severidad / categoría / funcionalidad / estado:** P2 / cálculo-dinero / IVA y total / parcial.
- **Archivo y línea:** `calculate-quote.ts:54-73`; `format.ts:1-8`.
- **Evidencia observada:** hecho comprobado. Libreta mínima produce IVA interno 110.437,5 y total 691.687,5, mostrados 110.438 y 691.688.
- **Reproducción:** abrir cotizador de libreta con valores por defecto.
- **Esperado / obtenido:** política explícita y mismos importes en todas las capas / redondeo solo al formatear.
- **Impacto:** futura persistencia o integraciones podrían guardar valores distintos a UI/WhatsApp.
- **Causa probable:** `number` + `Intl.NumberFormat(maximumFractionDigits: 0)` sin normalización.
- **Recomendación / esfuerzo / confianza:** definir unidad, momento y método de redondeo; usar enteros/decimal; **M**; **alta**.

#### TINTA-006 — Doble envío abre dos solicitudes

- **Severidad / categoría / funcionalidad / estado:** P2 / UX-idempotencia / submit / rota.
- **Archivo y línea:** `product-quote-calculator.tsx:112-149,300,333`.
- **Evidencia observada:** hecho comprobado; doble clic produjo dos llamadas interceptadas a `window.open`.
- **Reproducción:** completar campos válidos y hacer doble clic en “Solicitar por WhatsApp”.
- **Esperado / obtenido:** una apertura / dos.
- **Impacto:** pestañas duplicadas; con persistencia futura causaría registros duplicados.
- **Causa probable:** no existe `isSubmitting`, lock o clave idempotente.
- **Recomendación / esfuerzo / confianza:** bloquear al primer submit y diseñar idempotencia server-side; **S**; **alta**.

#### TINTA-007 — Validación solo cliente, teléfono permisivo y sin límites

- **Severidad / categoría / funcionalidad / estado:** P2 / validación-seguridad / datos de contacto y mensaje / parcial.
- **Archivo y línea:** `product-quote-calculator.tsx:38-48,342-357`; `build-whatsapp-message.ts:20-44`.
- **Evidencia observada:** hechos comprobados: `abc3000000xyz` fue aceptado; inputs/textareas tienen `maxLength=-1`; 5.000 caracteres generaron URL de 5.950.
- **Reproducción:** completar teléfono alfanumérico o comentario largo y enviar interceptando.
- **Esperado / obtenido:** datos normalizados y límites útiles / cualquier texto con siete dígitos y longitud ilimitada.
- **Impacto:** solicitudes inutilizables, límites del cliente WhatsApp y falta de autenticidad.
- **Causa probable:** regex mínima y ausencia de backend/schema.
- **Recomendación / esfuerzo / confianza:** schema compartido, normalización E.164, máximos por campo y validación servidor; **M**; **alta**.

#### TINTA-008 — Faltan opciones comerciales esenciales por producto

- **Severidad / categoría / funcionalidad / estado:** P2 / funcional / configuración de producto / parcial.
- **Archivo y línea:** `src/types/product.ts:45-60`; todos los objetos de `products.ts`.
- **Evidencia observada:** hecho comprobado: el modelo solo contiene técnica y adicionales; no talla, color, material, capacidad, distribución, área/tintas o entrega.
- **Reproducción:** cotizar camiseta, gorra, mug o USB; revisar campos disponibles.
- **Esperado / obtenido:** capturar atributos que afectan producción/precio / solicitud genérica.
- **Impacto:** estimación incompleta y trabajo manual posterior; no permite confirmar producibilidad.
- **Causa probable:** MVP reducido a catálogo genérico.
- **Recomendación / esfuerzo / confianza:** definir schema de opciones por producto y reglas de precio/obligatoriedad; **L (3–7 días)**; confianza **alta**, criticidad comercial **media-alta**.

#### TINTA-009 — “Valor desde” no representa el escenario cotizable

- **Severidad / categoría / funcionalidad / estado:** P2 / UX-precio / catálogo y detalle / parcial.
- **Archivo y línea:** `product-card.tsx:11-18`; `producto/[slug]/page.tsx:41-43,85-86`; cotizador:178.
- **Evidencia observada:** hecho comprobado. Se usa el mínimo precio base de todos los tramos, excluyendo técnica, preparación e IVA; la camiseta anuncia desde $25.000 aunque a mínimo el base es $32.000 y requiere técnica/setup.
- **Reproducción:** comparar tarjeta, detalle y resumen a mínimo.
- **Esperado / obtenido:** precio contextual o etiqueta “base sin personalización/IVA” / “valor estimado desde”.
- **Impacto:** expectativa de precio artificialmente baja.
- **Causa probable:** reutilizar `Math.min(priceTiers.unitPrice)`.
- **Recomendación / esfuerzo / confianza:** mostrar escenario completo mínimo o aclarar cada exclusión; **M**; **alta**.

#### TINTA-010 — Identificador `#001` fijo y no verificable

- **Severidad / categoría / funcionalidad / estado:** P2 / integridad-UX / identidad de solicitud / rota.
- **Archivo y línea:** `product-quote-calculator.tsx:158,167`.
- **Evidencia observada:** hecho comprobado; todas las solicitudes muestran “Manifiesto de producción #001”; WhatsApp no contiene ID.
- **Reproducción:** abrir cualquier producto y comparar.
- **Esperado / obtenido:** sin número o ID único real / pseudoidentificador fijo.
- **Impacto:** confusión con una orden, manifiesto o cotización formal.
- **Causa probable:** texto visual estático.
- **Recomendación / esfuerzo / confianza:** eliminar hasta que exista persistencia o usar ID público del commit transaccional; **S**; **alta**.

#### TINTA-011 — Selector de archivo no conectado a la solicitud

- **Severidad / categoría / funcionalidad / estado:** P2 / funcional-UX / arte / parcial.
- **Archivo y línea:** `product-quote-calculator.tsx:65,256-265`; mensaje `build-whatsapp-message.ts:20-44`.
- **Evidencia observada:** hecho comprobado: el `File` solo vive en estado, no se sube y el mensaje no dice que hay uno pendiente.
- **Reproducción:** seleccionar archivo, verificar texto local y construir mensaje.
- **Esperado / obtenido:** vínculo seguro o indicación inequívoca / archivo desaparece al salir.
- **Impacto:** usuario puede creer que el arte quedó asociado.
- **Causa probable:** limitación de prefilled WhatsApp tratada como UI local.
- **Recomendación / esfuerzo / confianza:** retirar selector, o subir a almacenamiento de prueba/producción con antivirus y URL firmada, o agregar una instrucción explícita al mensaje; **M–L**; **alta**.

#### TINTA-012 — Privacidad e identidad empresarial pendientes

- **Severidad / categoría / funcionalidad / estado:** P2 / legal-UX / datos personales / no implementada.
- **Archivo y línea:** `product-quote-calculator.tsx:285,304`; `site-footer.tsx:7`.
- **Evidencia observada:** hecho: se solicita nombre, ciudad, teléfono/email y se envía a WhatsApp; no hay enlace de privacidad/consentimiento; footer dice información pendiente.
- **Reproducción:** recorrer formulario y footer.
- **Esperado / obtenido:** responsable, finalidad, canal, autorización y política / solo aviso de no almacenamiento propio.
- **Impacto:** riesgo legal y de confianza, aunque no exista base propia.
- **Causa probable:** foco técnico en demo.
- **Recomendación / esfuerzo / confianza:** revisión legal colombiana, textos y consentimiento mínimo antes de envío; **M**; presencia **alta**, conclusión legal definitiva **no emitida**.

#### TINTA-013 — Encabezados de seguridad no configurados

- **Severidad / categoría / funcionalidad / estado:** P2 / seguridad web / todas las páginas / parcial.
- **Archivo y línea:** `next.config.ts:1-5`; evidencia HTTP local.
- **Evidencia observada:** hecho local: faltan CSP, nosniff, referrer, permissions y framing; aparece `X-Powered-By`.
- **Reproducción:** `curl -sS -D - -o /dev/null http://127.0.0.1:3017/`.
- **Esperado / obtenido:** baseline de producción / defaults de Next.
- **Impacto:** menor defensa contra XSS, clickjacking y filtración de capacidades/referrer.
- **Causa probable:** config vacía. El proxy final podría aportar headers, no comprobado.
- **Recomendación / esfuerzo / confianza:** definir CSP compatible, nosniff, referrer, permissions, frame-ancestors y ocultar powered-by; **M**; confianza app **alta**, deployment final **media**.

#### TINTA-014 — No existen pruebas automatizadas del motor crítico

- **Severidad / categoría / funcionalidad / estado:** P2 / calidad / cálculo, datos y flujo / no implementada.
- **Archivo y línea:** `package.json:5-10`; no hay archivos test/config.
- **Evidencia observada:** hecho comprobado. El build ejecuta integridad básica, pero no hay unit/integration/E2E versionados.
- **Reproducción:** `npm run`; buscar `*test*`, `*spec*` y configs.
- **Esperado / obtenido:** pruebas de tramos, IVA, límites, quote-only, mensajes y errores / ninguna.
- **Impacto:** regresiones financieras o de catálogo llegan al build sin detección específica.
- **Causa probable:** validación ad hoc en `assertCatalogIntegrity`.
- **Recomendación / esfuerzo / confianza:** suite de funciones puras, pruebas de catálogo y Playwright CI sin destino real; **L**; **alta**.

#### TINTA-015 — El móvil oculta el desglose de la estimación

- **Severidad / categoría / funcionalidad / estado:** P2 / UX / resumen / parcial.
- **Archivo y línea:** `product-quote-calculator.tsx:297-325`.
- **Evidencia observada:** hecho comprobado a 390 px: panel `Resumen de solicitud` no visible; barra fija solo muestra total.
- **Reproducción:** abrir cotizador móvil y revisar subtotal/IVA/cargos antes de submit.
- **Esperado / obtenido:** desglose revisable / solo total agregado.
- **Impacto:** menor transparencia justo en el canal principal de WhatsApp móvil.
- **Causa probable:** `hidden ... lg:block` sin resumen alternativo.
- **Recomendación / esfuerzo / confianza:** acordeón/resumen móvil con todas las líneas y exclusiones; **M**; **alta**.

#### TINTA-025 — Cupón promocional sin reglas ni conexión al cotizador

- **Severidad / categoría / funcionalidad / estado:** P2 / funcional-comercial / promoción de llaveros / parcial.
- **Archivo y línea:** `src/app/page.tsx:17-49`; `src/components/promotion/promotion-splash.tsx:136-177`; no existe regla de descuento en `calculate-quote.ts`.
- **Evidencia observada:** hecho comprobado. El dialog dice “Estamos de promoción” y “Cupón LLAVERO”; el enlace interceptado solo solicita información e incluye producto/referencia. No declara porcentaje/valor, vigencia, mínimo, stock o términos y el cupón no llega al cotizador.
- **Reproducción:** abrir landing en una sesión nueva; inspeccionar CTA sin navegar; cerrar, abrir el llavero y entrar al cotizador.
- **Esperado / obtenido:** campaña definida, transportada y validada o descrita claramente como consulta / código decorativo separado del cálculo.
- **Impacto:** expectativa comercial no verificable, aplicación manual inconsistente y posible reclamo por publicidad ambigua.
- **Causa probable:** splash implementado como pieza independiente de WhatsApp, sin modelo de promociones.
- **Recomendación / esfuerzo / confianza:** definir beneficio, elegibilidad, vigencia y términos; llevar campaign ID al cotizador/servidor/mensaje y calcularlo de forma auditable; hasta entonces usar “consultar campaña” en lugar de “cupón”; **M–L (2–5 días)**; **alta**.

#### TINTA-016 — README promete búsqueda, filtros y orden inexistentes

- **Severidad / categoría / funcionalidad / estado:** P3 / documentación / catálogo / rota.
- **Archivo y línea:** `README.md:12`; `catalogo/page.tsx:29-38`.
- **Evidencia observada:** hecho comprobado en DOM y código: solo grid.
- **Reproducción:** abrir `/catalogo`.
- **Esperado / obtenido:** controles según README / ninguno.
- **Impacto:** documentación y criterios de aceptación falsos.
- **Causa probable:** README no actualizado o feature removida.
- **Recomendación / esfuerzo / confianza:** corregir README (**S**) o implementar controles (**M**); **alta**.

#### TINTA-017 — Modo de precio `fixed` incompleto

- **Severidad / categoría / funcionalidad / estado:** P3 / arquitectura / motor / parcial.
- **Archivo y línea:** `product.ts:1`; `calculate-quote.ts:20,38-39`; `validate-catalog.ts:80-120`.
- **Evidencia observada:** inferencia fuerte: solo `quote-only` tiene rama; cualquier `fixed` cae en búsqueda de tramo y puede fallar. No hay productos fixed actuales.
- **Reproducción:** no realizada para no modificar catálogo; lectura de ramas.
- **Esperado / obtenido:** contrato tipado soportado / camino incompleto.
- **Impacto:** futura referencia fixed rompería cotización y podría no ser validada por integridad.
- **Causa probable:** tipo adelantado a implementación.
- **Recomendación / esfuerzo / confianza:** implementar y testear o retirar del union; **M**; **media-alta**.

#### TINTA-018 — Analítica sin consumidor confirmado

- **Severidad / categoría / funcionalidad / estado:** P3 / observabilidad / eventos / simulada.
- **Archivo y línea:** `analytics.ts:3-7`; eventos en cotizador:141-147.
- **Evidencia observada:** hecho: dispara `CustomEvent` y escribe solo si ya existe `dataLayer`; no hay proveedor/script.
- **Reproducción:** inspeccionar red y código; cero request analítico.
- **Esperado / obtenido:** medición observable / eventos locales efímeros.
- **Impacto:** métricas `quote_completed` pueden creerse disponibles y además se emiten sin persistencia real.
- **Causa probable:** hook preparado para integración futura.
- **Recomendación / esfuerzo / confianza:** definir semántica, consentimiento y consumidor o retirar; **S–M**; **alta**.

#### TINTA-019 — CSS duplicado, referencias inefectivas y exports muertos

- **Severidad / categoría / funcionalidad / estado:** P3 / mantenibilidad / estilos/componentes / parcial.
- **Archivo y línea:** `tokens.css:16-25`; `globals.css:35`; `product-card.tsx:14`; `ui/feedback.tsx:3`; `ui/form-controls.tsx:6`.
- **Evidencia observada:** hechos: tokens repetidos, sombras no definidas, IDs en español no coinciden y varios exports sin uso.
- **Reproducción:** búsquedas `rg` de símbolos/variables.
- **Esperado / obtenido:** design tokens únicos y referencias válidas / deuda menor.
- **Impacto:** estilos esperados no se aplican y aumenta ruido.
- **Causa probable:** iteraciones visuales acumuladas.
- **Recomendación / esfuerzo / confianza:** limpieza con regresión visual; **S**; **alta**.

#### TINTA-020 — Warnings de desarrollo por scroll y origen HMR

- **Severidad / categoría / funcionalidad / estado:** P3 / DX / navegación local / parcial.
- **Archivo y línea:** `globals.css:11`; `layout.tsx:38`; `next.config.ts:3`; `.next/dev/logs/next-development.log`.
- **Evidencia observada:** hecho: Next pidió `data-scroll-behavior="smooth"`; HMR bloqueó origen 127.0.0.1 distinto del host.
- **Reproducción:** navegar al dev preexistente por 127.0.0.1.
- **Esperado / obtenido:** consola dev limpia / warnings y 2 WebSocket fallidos.
- **Impacto:** Fast Refresh no funciona desde ese host; producción no afectada.
- **Causa probable:** host inconsistente y nueva convención Next 16.
- **Recomendación / esfuerzo / confianza:** usar un host único, configurar origen solo si se necesita y añadir atributo documentado; **S**; **alta**.

#### TINTA-021 — Build dependiente de red y scripts npm bloqueados

- **Severidad / categoría / funcionalidad / estado:** P3 / build-reproducibilidad / CI / parcial.
- **Archivo y línea:** `layout.tsx:2,7-23`; lock de sharp/unrs-resolver.
- **Evidencia observada:** hecho: build aislado falló por 3 Google Fonts; con red pasó. npm 12 bloqueó 2 install scripts.
- **Reproducción:** `npm ci`; `npm run build` sin y con red.
- **Esperado / obtenido:** build hermético / requiere Google Fonts y política npm implícita.
- **Impacto:** CI restringido puede fallar; binarios opcionales pueden variar.
- **Causa probable:** `next/font/google` y npm 12 `allowScripts`.
- **Recomendación / esfuerzo / confianza:** versionar fuentes autorizadas localmente y definir política de scripts; **M**; **alta**.

#### TINTA-022 — SEO técnico incompleto

- **Severidad / categoría / funcionalidad / estado:** P3 / SEO / indexación y sharing / parcial.
- **Archivo y línea:** `layout.tsx:25-30`; metadata de producto `page.tsx:21-30,45-60`; ausencia de archivos metadata.
- **Evidencia observada:** hecho: títulos, descripciones y JSON-LD existen; faltan `metadataBase`, canonical, sitemap, robots, OG image y datos empresariales completos.
- **Reproducción:** inspeccionar rutas de metadata y HTML.
- **Esperado / obtenido:** baseline de publicación / metadata parcial.
- **Impacto:** descubrimiento, URLs absolutas y previews menos fiables.
- **Causa probable:** MVP.
- **Recomendación / esfuerzo / confianza:** completar Metadata API tras definir dominio/empresa; **M**; **alta**.

#### TINTA-023 — Validación débil del número de WhatsApp

- **Severidad / categoría / funcionalidad / estado:** P3 / configuración / destino / parcial.
- **Archivo y línea:** `build-whatsapp-url.ts:1-8`.
- **Evidencia observada:** hecho: elimina no dígitos y solo exige no vacío; no valida longitud, E.164 o país. La variable actual sí dio 12 dígitos/prefijo 57.
- **Reproducción:** lectura de función; integridad prueba solo un ejemplo.
- **Esperado / obtenido:** fallo temprano ante config inválida / cualquier cadena con dígitos genera enlace.
- **Impacto:** despliegue mal configurado enviaría al destino incorrecto o URL inválida.
- **Causa probable:** normalización confundida con validación.
- **Recomendación / esfuerzo / confianza:** validator en build/start y formato E.164; **S**; **alta**.

#### TINTA-024 — Tipografía técnica excesivamente pequeña

- **Severidad / categoría / funcionalidad / estado:** P3 / accesibilidad-UX / legibilidad / parcial.
- **Archivo y línea:** ejemplos en `site-footer.tsx:7`, `product-quote-calculator.tsx:167-168,256,299,332`.
- **Evidencia observada:** hecho: numerosos textos de 8, 9 y 10 px, algunos con mayúsculas/letter spacing.
- **Reproducción:** inspeccionar a 320/390 px o estilos computados.
- **Esperado / obtenido:** información comercial legible / tamaños inferiores a estándares cómodos.
- **Impacto:** dificultad para baja visión y pantallas densas.
- **Causa probable:** dirección visual “técnica”.
- **Recomendación / esfuerzo / confianza:** escala mínima 12–14 px para información significativa y test visual; **S–M**; **alta**.

## 14. Funcionalidades faltantes o simuladas

- Supabase/PostgreSQL, RLS, tablas y persistencia: faltantes.
- Registro de cliente: faltante.
- Cotización formal y `cotizacion_items`: faltantes.
- Operación atómica, rollback e idempotencia: faltantes.
- ID real de cotización: faltante; `#001` es decorativo.
- Archivo: selector local no conectado.
- Analítica: eventos preparados, consumidor no conectado.
- Promoción: splash y cupón conectados solo a un mensaje informativo; descuento, vigencia y reglas no implementados.
- Búsqueda, filtros y ordenamiento: documentados, no implementados.
- Carrito/multiproducto: no implementado; el flujo real es monoproducto.
- Variantes detalladas: no implementadas.
- Factura: no implementada y no debe presentarse como tal.
- Productos `quote-only` o `fixed`: no hay ninguno en el catálogo vigente; soporte fixed incompleto.

## 15. Limitaciones de la auditoría

- No se consultó el Supabase remoto heredado porque no se pudo demostrar que fuera local/prueba; RLS y esquema efectivo quedaron no comprobables.
- No se hicieron escrituras, migraciones, inserts, mensajes reales ni navegación fuera de localhost.
- No se verificó apertura de app nativa WhatsApp en dispositivo físico; la URL fue interceptada antes de abandonar la app.
- No se midieron Core Web Vitals de campo, Lighthouse, lector de pantalla real ni contraste con herramienta WCAG dedicada.
- No se probaron datos vacíos cambiando el catálogo porque la fase prohíbe modificar código/datos; se inspeccionaron las ramas UI existentes.
- No se probó precio base cero porque el catálogo actual lo impide en build; sí se probó el adicional cero real.
- Las políticas o tablas que pudieran existir en un proyecto Supabase externo no pueden inferirse de variables locales.
- Hubo cambios concurrentes en cinco archivos rastreados y se añadió un componente promocional no rastreado durante la auditoría. Se repitieron TypeScript, lint, build y pruebas sobre el estado estable final; el informe no atribuye esos cambios a la auditoría.
- El navegador Playwright no era dependencia del proyecto. Se descargó Chromium en caché de usuario con autorización y se ejecutaron scripts inline no persistidos; no se alteró `package.json` ni el lockfile.

## 16. Plan recomendado de corrección por fases

### Fase 0 — Decisión de producto y contención (1–2 días)

1. Decidir formalmente si TINTA será solo generador frontend o sistema persistente.
2. Retirar/renombrar `#001`, “manifiesto” y cualquier texto que implique documento emitido.
3. Corregir recargos “por validar”: no mostrar total completo cuando haya importes desconocidos.
4. Limitar cantidad, teléfono y textos; prevenir doble submit.
5. Publicar identidad empresarial, privacidad y tratamiento de datos mínimos.
6. Definir o retirar temporalmente el cupón LLAVERO hasta tener beneficio, vigencia y condiciones verificables.

### Fase 1 — Seguridad y confiabilidad frontend (2–4 días)

1. Actualizar Next/dependencias según advisories y guías locales de Next 16.
2. Fijar política monetaria y de redondeo; centralizar tasa/labels.
3. Corregir precio “desde” y resumen móvil.
4. Validar E.164/configuración de WhatsApp en build.
5. Configurar headers y fuentes locales.
6. Añadir unit tests del motor y catálogo.

### Fase 2 — Backend de cotizaciones (1–2 semanas)

1. Diseñar esquema clientes/cotizaciones/ítems con `numeric` o unidades enteras y constraints.
2. Crear entorno Supabase separado de producción.
3. Implementar RLS deny-by-default; sin `SELECT` anon de PII.
4. Implementar endpoint/Server Action con schema, rate limit y catálogo/precio server-side.
5. Transacción atómica/idempotente con rollback e ID público.
6. Abrir WhatsApp únicamente tras commit exitoso; mostrar error/reintento seguro si falla.

### Fase 3 — Funcionalidad comercial y archivos (3–7 días)

1. Modelar variantes por referencia y datos obligatorios.
2. Decidir flujo de arte: quitar selector o implementar almacenamiento seguro, límites, MIME real, antivirus y URLs firmadas.
3. Añadir estado/seguimiento de cotización, vigencia y condiciones comerciales.
4. Confirmar reglas de IVA/exenciones con responsable fiscal; no asumir universalidad.

### Fase 4 — Release (2–4 días)

1. E2E contra Supabase de staging y destino WhatsApp ficticio/interceptado.
2. Tests de fallo en cada paso, idempotencia, RLS y acceso cruzado.
3. Lighthouse, axe/contraste, teclado y dispositivo móvil real.
4. CI con `npm ci`, lint, typecheck, unit, integración, E2E, audit y build sin dependencia de red no controlada.
5. Revisión final de SEO, headers, observabilidad y runbook.

## 17. Criterios para considerar listo el MVP

El MVP solo debería marcarse listo cuando todos estos criterios sean verificables:

- alcance decidido y textos coherentes: solicitud estimada versus cotización formal;
- cero P0/P1 abiertos y P2 aceptados explícitamente;
- `npm ci`, lint, TypeScript, unit, integración, E2E y build pasan en CI;
- cero vulnerabilidades altas/críticas explotables sin excepción documentada;
- precios, cargos desconocidos, IVA y redondeo aprobados por negocio/fiscal;
- límites de cantidad y campos, esquema compartido y validación servidor;
- cliente, cotización e ítems guardados atómicamente e idempotentemente si la persistencia sigue en alcance;
- RLS efectivo probado: anon/auth sin lectura de PII ajena ni mutación de campos protegidos;
- WhatsApp solo abre tras éxito de guardado y contiene ID, datos y totales idénticos;
- doble clic/reintentos no duplican registros ni pestañas;
- variantes mínimas por producto capturadas;
- promociones con reglas, vigencia, términos y efecto monetario verificables;
- aviso de privacidad, identidad empresarial y consentimiento publicados;
- desglose completo disponible en escritorio y móvil;
- WCAG básica, contraste, foco, teclado, alt, labels y dispositivo real aprobados;
- headers de seguridad, dominio, HTTPS, metadata, sitemap/robots y monitoreo configurados;
- entorno staging separado y ninguna prueba automatizada apunta a producción.

## 18. Archivos que deberían revisarse primero al comenzar las correcciones

1. `src/components/product-quote-calculator.tsx` — validación, estado, doble envío, mobile, archivo y orquestación.
2. `src/lib/quotation/calculate-quote.ts` — tasa, precisión, cargos desconocidos y contrato monetario.
3. `src/lib/quotation/validate-quotation.ts` — límites seguros y reglas por producto.
4. `src/data/additionals.ts` — sentinel de precio cero/por validar.
5. `src/data/products.ts` y `src/types/product.ts` — variantes, tramos, tipos y fuente real.
6. `src/lib/whatsapp/build-whatsapp-message.ts` — exclusiones, ID, archivo y consistencia.
7. `src/lib/whatsapp/build-whatsapp-url.ts` — E.164 y configuración.
8. `src/components/promotion/promotion-splash.tsx` y `src/app/page.tsx` — reglas, términos y transporte del cupón.
9. `package.json` / `package-lock.json` — vulnerabilidades y scripts de calidad, en una fase autorizada.
10. `next.config.ts` y `src/app/layout.tsx` — headers, fuentes, metadata y scroll.
11. Nuevo backend/DAL y esquema Supabase de staging — solo después de aprobar arquitectura, migraciones y políticas.

---

**Conclusión final:** el frontend local de TINTA es navegable, responsive y capaz de generar una solicitud estimada correctamente codificada para WhatsApp en los casos con precios conocidos. No obstante, la plataforma vigente no registra clientes ni cotizaciones, no tiene Supabase operativo y contiene problemas de precio incompleto, validación, duplicidad, seguridad de dependencias y preparación legal. La siguiente acción recomendada es aprobar primero la decisión de arquitectura —frontend informativo o MVP persistente— y, si se mantiene el objetivo original, diseñar el backend transaccional y RLS en un entorno de staging antes de implementar cualquier corrección en producción.
