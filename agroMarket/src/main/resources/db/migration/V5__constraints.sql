-- V5__constraints.sql
-- Idempotent constraints for MySQL 8.4.

DELIMITER //

DROP PROCEDURE IF EXISTS ensure_constraint_exists//
CREATE PROCEDURE ensure_constraint_exists(
	IN p_table_name VARCHAR(64),
	IN p_constraint_name VARCHAR(64),
	IN p_constraint_type VARCHAR(16),
	IN p_definition TEXT
)
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.table_constraints
		WHERE table_schema = DATABASE()
		  AND table_name = p_table_name
		  AND constraint_name = p_constraint_name
		  AND constraint_type = p_constraint_type
	) THEN
		SET @sql = CONCAT(
			'ALTER TABLE `', p_table_name, '` ADD CONSTRAINT `', p_constraint_name, '` ',
			IF(p_constraint_type = 'CHECK', CONCAT('CHECK (', p_definition, ')'), CONCAT('UNIQUE (', p_definition, ')'))
		);
		PREPARE stmt FROM @sql;
		EXECUTE stmt;
		DEALLOCATE PREPARE stmt;
	END IF;
END//

DELIMITER ;

CALL ensure_constraint_exists('resenas', 'uk_resenas_comprador_producto', 'UNIQUE', '`comprador_id`, `producto_id`');
CALL ensure_constraint_exists('resenas', 'chk_resenas_calificacion', 'CHECK', '`calificacion` BETWEEN 1 AND 5');
CALL ensure_constraint_exists('productos', 'chk_productos_precio', 'CHECK', '`precio` > 0');
CALL ensure_constraint_exists('pedidos', 'chk_pedidos_cantidad', 'CHECK', '`cantidad` >= 1');
CALL ensure_constraint_exists('usuarios', 'chk_usuarios_rol', 'CHECK', '`rol` IN (''COMPRADOR'', ''PRODUCTOR'', ''ADMINISTRADOR'')');

DROP PROCEDURE IF EXISTS ensure_constraint_exists;