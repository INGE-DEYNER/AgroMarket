-- Deshace la migracion de prueba V2 y deja la base como estaba.
DROP TABLE IF EXISTS prueba_migraciones;
DELETE FROM flyway_schema_history WHERE version = '2';

SELECT installed_rank, version, description, success
FROM flyway_schema_history ORDER BY installed_rank;

SELECT COUNT(*) AS tablas_en_total
FROM information_schema.tables WHERE table_schema = 'agromarket';