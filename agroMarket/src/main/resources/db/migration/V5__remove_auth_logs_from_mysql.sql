-- V5__remove_auth_logs_from_mysql.sql
-- authentication_logs debe estar en MongoDB, no en MySQL
-- Eliminar tabla de MySQL si existe

DROP TABLE IF EXISTS authentication_logs;
