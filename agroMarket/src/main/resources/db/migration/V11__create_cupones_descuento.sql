CREATE TABLE cupones_descuento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    monto_minimo DECIMAL(10,2) NOT NULL,
    usuario_id BIGINT NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_expiracion DATETIME(6) NOT NULL
);
