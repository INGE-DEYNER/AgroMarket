# Reorganización de Base de Datos - AgroMarket

Esta documentación describe la reorganización de la base de datos siguiendo el principio de separación entre datos transaccionales (MySQL) y datos no estructurados/logs (MySQL).

## Estructura MySQL (Datos Transaccionales)

### Tablas Principales

| Tabla | Descripción | Entidad JPA |
|-------|-------------|-------------|
| `users` | Usuarios del sistema | `UserEntity` |
| `roles` | Roles de usuario | `RoleEntity` |
| `user_roles` | Relación usuario-roles | - |
| `products` | Productos del catálogo | `ProductEntity` |
| `categories` | Categorías de productos | `CategoryEntity` |
| `product_categories` | Relación producto-categoría | - |
| `vendors` | Vendedores/Productores | `VendorEntity` |
| `inventory` | Inventario de productos | `InventoryEntity` |
| `carts` | Carritos de compra | `CartEntity` |
| `cart_items` | Items del carrito | `CartItemEntity` |
| `orders` | Pedidos | `OrderEntity` |
| `order_details` | Detalles de pedidos | `OrderDetailEntity` |
| `payments` | Pagos | `PaymentEntity` |
| `addresses` | Direcciones | `AddressEntity` |
| `favorites` | Favoritos | `FavoriteEntity` |
| `reviews` | Reseñas simples | `ReviewEntity` |
| `product_images` | URL de imágenes de productos | `ProductImageEntity` |

### Diagrama de Relaciones

```
users (1) ←→ (N) orders
users (1) ←→ (N) products (as producer)
users (1) ←→ (N) reviews
products (1) ←→ (N) order_details
products (1) ←→ (N) cart_items
products (1) ←→ (N) favorites
categories (1) ←→ (N) products
vendors (1) ←→ (N) products
orders (1) ←→ (1) payments
orders (1) ←→ (1) shipping
```

## Estructura MongoDB (Datos No Estructurados)

### Colecciones

| Colección | Descripción | Documento |
|-----------|-------------|-----------|
| `chatbot_conversations` | Conversaciones del chatbot | `ChatbotConversationDocument` |
| `chatbot_messages` | Mensajes del chatbot | `ChatbotMessageDocument` |
| `user_activity_logs` | Historial de actividad | `UserActivityLogDocument` |
| `system_logs` | Logs del sistema | `SystemLogDocument` |
| `user_events` | Eventos de usuario | `UserEventDocument` |
| `dynamic_metadata` | Metadata variable | `DynamicMetadataDocument` |
| `complex_notifications` | Notificaciones complejas | `ComplexNotificationDocument` |
| `conversation_history` | Historial de conversaciones | `ConversationHistoryDocument` |

## Migraciones SQL (Flyway)

Las migraciones están ubicadas en `src/main/resources/db/migration/`

### Orden de ejecución:
1. `V1__create_users_and_roles.sql`
2. `V2__create_products_and_categories.sql`
3. `V3__create_vendors_and_inventory.sql`
4. `V4__create_orders_and_order_details.sql`
5. `V5__create_payments_and_addresses.sql`
6. `V6__create_cart_and_favorites.sql`
7. `V7__create_reviews.sql`
8. `V8__create_product_images.sql`

## Cambios Respecto a la Estructura Actual

### Moved from MongoDB to MySQL:
- `users` → Ahora en MySQL (antes en MongoDB)
- `products` → Ahora en MySQL (antes en MongoDB)
- `orders` → Ahora en MySQL (antes en MongoDB)
- `payments` → Ahora en MySQL (antes en MongoDB)

### Moved from MySQL to MongoDB:
- `UserActivityEvent` → Ahora en MongoDB
- `Message` (chat) → Ahora en MongoDB
- `Notification` → Ahora en MongoDB (para notificaciones complejas)

### Nuevas tablas/colecciones:
- `categories` (MySQL)
- `vendors` (MySQL)
- `inventory` (MySQL)
- `cart_items` (MySQL)
- `order_details` (MySQL)
- `product_images` (MySQL)
- `addresses` (MySQL)
- `favorites` (MySQL)
- `reviews` (MySQL)

## Notas de Implementación

1. **Imágenes físicas**: Se mantienen en la nube (actual implementación)
2. **URL de imágenes**: Se almacenan en MySQL (`product_images` table)
3. **Foreign keys**: Se deben mantener en MySQL para integridad referencial
4. **Indexes**: Se deben crear indexes en columnas frecuentemente consultadas
5. **MongoDB**: Se usa auto-index-creation para colecciones nuevas
