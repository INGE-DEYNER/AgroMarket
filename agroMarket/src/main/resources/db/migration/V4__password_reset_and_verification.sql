-- Create table for password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiry TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE INDEX idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX idx_prt_token ON password_reset_tokens(token);
-- Create table for email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiry TIMESTAMP NOT NULL,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evt_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE INDEX idx_email_verification_usuario ON email_verification_tokens(usuario_id);
CREATE INDEX idx_evt_token ON email_verification_tokens(token);
