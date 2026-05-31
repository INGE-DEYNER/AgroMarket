-- V3__constraints.sql
-- Flyway migration: unique constraints and indexes to improve security and performance
-- Keep statements simple for MySQL 8.x and H2 compatibility.

-- Add unique constraint for reviews to prevent duplicate reviews by the same buyer for the same product
ALTER TABLE resenas
ADD CONSTRAINT uk_resenas_comprador_producto UNIQUE (comprador_id, producto_id);

-- Add check constraint for review ratings
ALTER TABLE resenas
ADD CONSTRAINT chk_resenas_calificacion CHECK (calificacion >= 1 AND calificacion <= 5);

-- Add check constraint for product prices
ALTER TABLE productos
ADD CONSTRAINT chk_productos_precio CHECK (precio >= 0);

-- Add check constraint for order quantities
ALTER TABLE pedidos
ADD CONSTRAINT chk_pedidos_cantidad CHECK (cantidad > 0);

-- Add check constraint for user roles
ALTER TABLE usuarios
ADD CONSTRAINT chk_usuarios_rol CHECK (rol IN ('COMPRADOR', 'PRODUCTOR', 'ADMINISTRADOR'));

-- Add unique constraint for user emails
CREATE UNIQUE INDEX idx_usuarios_correo_unique ON usuarios (correo);

-- Add unique constraint for invoice numbers
CREATE UNIQUE INDEX idx_facturas_numero_factura_unique ON facturas (numero_factura);

-- Add indexes for common foreign keys and search fields
CREATE INDEX idx_productos_productor ON productos (productor_id);
CREATE INDEX idx_pedidos_comprador ON pedidos (comprador_id);
CREATE INDEX idx_pedidos_producto ON pedidos (producto_id);
CREATE INDEX idx_mensajes_remitente ON mensajes (remitente_id);
CREATE INDEX idx_mensajes_destinatario ON mensajes (destinatario_id);
CREATE INDEX idx_notificaciones_destinatario ON notificaciones (destinatario_id);
