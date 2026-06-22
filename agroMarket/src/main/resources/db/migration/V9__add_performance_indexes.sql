-- Optimización de Productos
CREATE INDEX idx_productos_activo_stock ON productos(activo, cantidad_disponible);
CREATE INDEX idx_productos_categoria ON productos(tipo_fruta);
CREATE INDEX idx_productos_productor ON productos(productor_id);
CREATE INDEX idx_productos_vendidos ON productos(total_vendido);

-- Optimización de Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(correo);
CREATE INDEX idx_usuarios_telefono ON usuarios(telefono);
CREATE INDEX idx_usuarios_estado ON usuarios(estado_cuenta);

-- Optimización de Pedidos
CREATE INDEX idx_pedidos_comprador ON pedidos(comprador_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- Optimización de Mensajes
CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id, leido);
