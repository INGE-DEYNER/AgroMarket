QA Checklist — Phase 4: Dashboards & Navbar

Instrucciones rápidas: abrir la app en un navegador con sesión de prueba (roles: comprador, productor, admin) y verificar cada punto.

- Navbar
  - [ ] Perfil: menú desplegable abre/cierra y muestra nombre/rol correctamente.
  - [ ] Enlaces: `Mi Panel`, `Catálogo`, `Mensajería`, `Pedidos` muestran según rol.
  - [ ] Botón carrito abre/cierra y muestra badge de items.

- Dashboard Comprador
  - [ ] Sección "Recomendados": imágenes cargan y nombres muestran texto escapado.
  - [ ] Pedidos recientes: tabla muestra producto, total y estado; botón "Rastrear" aparece según estado.
  - [ ] Modal factura abre con datos legibles y sin HTML sin escapear.

- Dashboard Productor
  - [ ] Inventario: listado de productos con imagen y nombre (sin inyección).
  - [ ] Crear/editar producto: modal abre, guarda y refresca listado.
  - [ ] Ventas recientes y tabla de pedidos: nombres escapados y botones de acción funcionan.
  - [ ] Gráfica de ventas: barras y etiquetas adaptadas correctamente.

- Mensajería
  - [ ] Lista de contactos muestra nombres y últimos mensajes escapados.
  - [ ] Conversación: enviar/recibir mensajes; burbujas muestran contenido escapado.

- Catálogo & Carrito
  - [ ] Grid de productos, botones "Agregar al carrito" funcionan.
  - [ ] Carrito: items listados, subtotal y total calculados, acciones de cantidad funcionan.

- Reseñas
  - [ ] Publicar reseña: valida rating y comentario; reseñas listadas con texto escapado.

- Envíos
  - [ ] Lista de envíos y tracking cards muestran ruta, transportista y estado (sin inyección).
  - [ ] Tabla historial muestra datos escapados.

- Comprobaciones generales
  - [ ] No se observan errores JS en consola al navegar por paneles.
  - [ ] Formularios muestran mensajes de error/éxito según resultado.
  - [ ] Pruebas unitarias locales ya pasaron (`mvn test`).

Notas:

- Si detectas texto con HTML crudo, reporta archivo y línea aproximada.
- Para reproducciones de bugs, adjunta pasos exactos y datos de entrada (usuario, rol, producto id).
