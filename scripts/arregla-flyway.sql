-- El intento de aplicar V1 sobre una base que ya tenia las 23 tablas fallo en
-- la PRIMERA sentencia (CREATE TABLE admins), asi que no se llego a crear
-- ninguna tabla nueva. Por eso se puede borrar el historial sin riesgo.
--
-- Sin esto, Flyway ve una migracion fallida en su tabla y se niega a arrancar
-- aunque este configurado con baseline-on-migrate.
DROP TABLE IF EXISTS flyway_schema_history;