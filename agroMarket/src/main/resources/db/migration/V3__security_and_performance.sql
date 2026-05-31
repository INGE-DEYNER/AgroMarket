-- V3__security_and_performance.sql
-- Idempotent index creation for MySQL 8.4.

DELIMITER //

DROP PROCEDURE IF EXISTS ensure_index_exists//
CREATE PROCEDURE ensure_index_exists(
	IN p_table_name VARCHAR(64),
	IN p_index_name VARCHAR(64),
	IN p_column_list VARCHAR(255),
	IN p_unique_flag BOOLEAN
)
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.statistics
		WHERE table_schema = DATABASE()
		  AND table_name = p_table_name
		  AND index_name = p_index_name
	) THEN
		SET @sql = CONCAT(
			'CREATE ',
			IF(p_unique_flag, 'UNIQUE ', ''),
			'INDEX `', p_index_name, '` ON `', p_table_name, '` (', p_column_list, ')'
		);
		PREPARE stmt FROM @sql;
		EXECUTE stmt;
		DEALLOCATE PREPARE stmt;
	END IF;
END//

DELIMITER ;

CALL ensure_index_exists('usuarios', 'idx_usuarios_correo_unique', '`correo`', TRUE);
CALL ensure_index_exists('facturas', 'idx_facturas_numero_factura_unique', '`numero_factura`', TRUE);
CALL ensure_index_exists('productos', 'idx_productos_productor', '`productor_id`', FALSE);
CALL ensure_index_exists('pedidos', 'idx_pedidos_comprador', '`comprador_id`', FALSE);
CALL ensure_index_exists('pedidos', 'idx_pedidos_producto', '`producto_id`', FALSE);
CALL ensure_index_exists('mensajes', 'idx_mensajes_remitente', '`remitente_id`', FALSE);
CALL ensure_index_exists('mensajes', 'idx_mensajes_destinatario', '`destinatario_id`', FALSE);
CALL ensure_index_exists('notificaciones', 'idx_notificaciones_destinatario', '`destinatario_id`', FALSE);

DROP PROCEDURE IF EXISTS ensure_index_exists;
