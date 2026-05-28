-- V3: security and performance hardening
-- V2 already defines the baseline schema and unique keys. This migration keeps the
-- schema idempotent and adds the requested performance indexes for hot relations.

CREATE INDEX IF NOT EXISTS idx_productos_productor ON productos(productor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_comprador ON pedidos(comprador_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_producto ON pedidos(producto_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_destinatario ON notificaciones(destinatario_id);
