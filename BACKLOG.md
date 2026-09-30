# Backlog técnico

Pendientes conocidos al cierre de la sesión del 2026-09-28/29. **No son
tareas abiertas a medias**: son decisiones que quedaron documentadas para no
perderse. Nada de esto está roto ahora mismo, salvo donde se dice lo contrario.

Ordenadas por lo que duele más si se deja.

---

## 1. 🔴 La sesión se puede cerrar sola (bug de autenticación)

**Estado:** sin arreglar. **Impacto:** usuarios deslogueados sin ver error.

`AuthContext.jsx` borra el token en cuanto la sesión no cuadra, sin
distinguir el motivo:

- `checkAuth` hace `JSON.parse(atob(token.split(".")[1]))` para leer la
  expiración. En Node funciona; en el navegador `atob` falla con Base64URL
  (los JWT usan `-` y `_`), la excepción cae en el `catch` de "token
  malformado" y **se borra la sesión de un usuario que sí tiene el token
  válido**. Va acompañado de `localStorage.removeItem("agromarket_cart")` en
  la misma rama.
- `CompletarCuentaModal.jsx` tiene un caso aparte: si algún mensaje de la API
  contiene "expirado", borra el token y manda a `/login` sin comprobar nada.

**Cómo se reproduce:** abrir la app con un token válido y dejar que
`checkAuth` corra. Se ve en Network como cero peticiones a `/usuarios/me` y
como una redirección a `/login?message=expired`.

**Por qué no se tocó:** cambiar el flujo de autenticación en producción es
decisión de Deyner, no una limpieza. Se diagnosticó con pila de llamadas
interceptada; la causa está confirmada.

**Qué haría falta:** distinguir tres casos (sin token / token inválido /
error de red). Un fallo de red **nunca** debería cerrar sesión. Y leer la
expiración con una decodificación Base64URL, no con `atob` a secas.

---

## 2. 🟡 Peso volumétrico en el cálculo de envío

**Estado:** sin implementar, requiere cambio de modelo.

Hoy el peso facturable es **la cantidad del pedido**, y funciona porque
AgroMarket vende todo por kilo (los productos solo admiten frutas, y el
frontend imprime "/kg" en catálogo, carrito y RFQ). Pero una transportadora
real cobra el mayor entre el peso real y el volumétrico:

```
volumétrico (kg) = alto_cm × ancho_cm × largo_cm / 5000
facturable       = máx(peso_real, volumétrico)
```

**Por qué no se hizo:** el modelo de producto no tiene `weightKg` ni
dimensiones. Agregarlos toca el formulario de publicación, la entidad, la base
de datos y la validación. Es un cambio de alcance mayor que debe aprobarse
antes.

**Dónde tocar:** `Product` (dominio y entidad), `CreateProductRequest`,
formulario de publicación, `OrderUseCase.calcularCostoEnvio()` (ya recibe el
peso por parámetro, así que el punto de entrada está preparado) y
`cotizadorEnvio.js` en el frontend.

---

## 3. 🟡 `style={{}}` inline en las secciones de los dashboards

**Estado:** deuda heredada, no urgente.

Varias secciones de Admin, Productor y Comprador llevan estilos inline en
lugar de clases. Funcionan, pero no se adaptan al tema oscuro: cada
`background: "white"` o `color: "#1b4332"` es un valor fijo que en modo oscuro
puede quedar ilegible.

**Por qué no se limpiaron:** se decidió no mezclar "mover código" con
"rediseñar estilos" en los commits de extracción de secciones. Era la
condición para que el diff fuera revisable.

**Cómo abordarlo:** sección por sección, de una en una, con captura antes y
después. Los tokens ya existen (`--ds-surface`, `--ds-text`, `--ds-border`),
así que es sustituir, no inventar.

---

## 4. 🟢 Mínimo de compra al detal

**Estado:** no existe. Solo hay `minimumWholesaleQuantity` (mayoreo).

Deyner confirmó que el mínimo de compra lo define **el productor al publicar
el producto**, no el sistema. Hoy puede fijar un mínimo mayorista pero no uno
para venta normal.

**Qué haría falta:** campo `minimumRetailQuantity` en el modelo de producto,
campo en el formulario de publicación, y validación en el carrito y en la
creación del pedido. **Decisión de negocio pendiente:** ¿debe aplicarse
también a la venta al detal?

---

## 5. 🟢 Costo de manejo / seguro en envíos

**Estado:** no activado. Falta decisión de negocio.

Envía, Interrapidísimo y Mercado Envíos cobran un porcentaje sobre el valor
declarado (típicamente 1–2 %, con un mínimo). Hoy AgroMarket no lo cobra.

**Por qué no se activó:** es una decisión comercial, no técnica. Hay que
definir el porcentaje, el mínimo y si aplica a todas las bandas de trayecto
o solo a las nacionales.

**Dónde tocar:** `ShippingTariffs` (backend) y `cotizadorEnvio.js`
(frontend), que ya reciben sus parámetros por configuración.

---

## 6. 🟢 `ownerId` en Mongo es en realidad `productId`

**Estado:** funciona, el nombre engaña.

En el documento de imágenes de Mongo, el campo que guarda a qué producto
pertenece la imagen se llama `ownerId`, pero contiene el **id del producto**.
Funciona por coincidencia de nombre en todas partes.

**Por qué no se renombró:** cambiar el nombre de un campo ya en uso implica
migrar los documentos existentes y tocar todos los sitios que lo leen o
escriben. El beneficio es de legibilidad, no de funcionamiento.

**Cómo abordarlo:** migración en dos tiempos — escribir en ambos campos
mientras corre, luego dejar de leer el viejo, y al final borrarlo.

---

## Notas de la sesión

- El control de tamaño de fuente del topbar (A−/A+) **se retiró a petición de
  Deyner**: el zoom lo controla el navegador. El código sigue en
  `FontScaleProvider`, listo para reintroducirse en Configuración → Apariencia
  si se quiere.
- Los locales `ar`, `de`, `fr`, `pt`, `zh` existen en `i18n/locales/` pero no
  los carga `i18n/index.js` ni son seleccionables. Están sin traducir (231
  claves faltan en cada uno). Traducción futura, no deuda activa.
