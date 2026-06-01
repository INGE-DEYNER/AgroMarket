ALTER TABLE usuarios ADD COLUMN aprobado BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS password_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_history_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_history_usuario ON password_history(usuario_id);

INSERT INTO password_history (usuario_id, contrasena_hash)
SELECT u.id, u.contrasena
FROM usuarios u
WHERE NOT EXISTS (
  SELECT 1
  FROM password_history ph
  WHERE ph.usuario_id = u.id
);
