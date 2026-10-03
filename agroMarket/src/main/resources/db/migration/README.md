# Esquema de la base de datos

## Qué hay aquí

`V1__esquema-inicial.sql` es una foto del esquema REAL de la base de datos de
producción: 23 tablas, 86 índices y 29 claves foráneas. Se volcó con `mysqldump
--no-data` de la base que está en marcha, no se escribió a mano.

Existe porque hasta ahora el esquema **no estaba en ningún archivo**. Con
`spring.jpa.hibernate.ddl-auto: update`, Hibernate inventa el esquema en cada
arranque a partir de las entidades y lo aplica contra MySQL. El resultado es que
el esquema de producción vive únicamente dentro de la base de datos, y el día
que haya que hacer una migración no hay ningún archivo contra el que compararla
ni ningún historial de qué cambió y cuándo.

## Por qué `update` era un problema

`update` hace crecer el esquema, pero **nunca borra**. Si una entidad se renombra
o se le quita un campo, la columna vieja se queda para siempre con sus datos
dentro. Tampoco guarda historial: nada registra qué cambió en cada despliegue.

## Qué se hizo ya

`application-prod.yml` ahora lleva `ddl-auto: validate` en vez de `update`.

`validate` no modifica nada: comprueba que las entidades coinciden con el esquema
existente y, si no coinciden, **la aplicación no arranca**. A partir de ahí un
despliegue ya no puede cambiar la base de datos por sorpresa.

Verificado contra la base real: el contenedor arranca y queda `healthy` con el
esquema de 23 tablas, y la batería de soporte sigue pasando 12/12.

En `application-dev.yml` sigue siendo `update`, que es lo apropiado para
desarrollar: en local interesa que crear un campo nuevo no exija escribir SQL.

## Qué se hizo: Flyway montado y probado

No era una tarea pendiente: **Flyway ya estaba declarado en el `pom.xml`**
(`flyway-core` y `flyway-mysql` 11.7.2, en `compile`). Lo que no había era
configuración ni ningún archivo de migración, y por eso no pasaba nada. Al crear
`V1__esquema-inicial.sql`, Flyway se activó solo e intentó aplicar el esquema
encima de la base que ya lo tenía.

El resultado fue el fallo más instructivo del asunto:

```
SQLSyntaxErrorException: Table 'admins' already exists
```

Flyway no modifica la base: se niega a arrancar porque el esquema ya existe y él
no sabe cómo llegó ahí. La aplicación entró en bucle de reinicio. Eso no es un
detalle: es exactamente lo que habría pasado en el primer despliegue a
producción.

## La configuración que lo resuelve

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 1
    validate-on-migrate: true
```

`baseline-on-migrate` marca el esquema existente como versión 1 **sin ejecutar
V1**. En una base vacía (entorno nuevo) V1 sí se aplica entera.

## Verificado contra la base real, no de palabra

1. **Baseline**: `Successfully baselined schema with version: 1` y
   `Current version of schema: 1`. No volvió a crear ninguna tabla.
2. **Arranque**: `Started AgroMarketApplication`, health 200, soporte 12/12.
3. **Una migración nueva se aplica de verdad**: se creó una `V2` de prueba y el
   arranque dio `Successfully applied 1 migration ... now at version v2`, con la
   tabla presente en la base. Esto es lo que con `ddl-auto: update` no se podía
   hacer: el esquema lo cambiaba Hibernate solo, sin dejar registro de qué pasó.

   Después se deshizo a mano. La base quedó como estaba: 23 tablas y el historial
   con solo la línea del baseline.

## Si alguna vez hay que rehacer esto

El intento fallido dejó un registro con `success = 0` en `flyway_schema_history`
y, con él, Flyway se negaba a arrancar aunque estuviera bien configurado. Se
borra solo con:

```sql
DROP TABLE IF EXISTS flyway_schema_history;
```

Es seguro **siempre que la migración fallida no haya creado nada a medias**. En
nuestro caso falló en la primera sentencia, así que no llegó a crear ninguna
tabla. Si hubiera creado alguna, hay que deshacerla a mano antes de borrar el
historial.

## Cómo volcar el esquema otra vez

```bat
ver-dump-esquema.cmd          :: dice cuántas tablas hay
ver-dump-esquema.cmd -crear   :: reescribe V1__esquema-inicial.sql
```

El volcado sale de este comando (ajusta usuario y clave):

```bat
docker exec asafrut-mysql mysqldump -uagromarket -pCLAVE ^
  --no-data --skip-add-drop-table --compact --skip-comments ^
  --skip-set-charset agromarket > esquema-dump.sql
```

## Regla a partir de ahora

Cuando se añada o renombre un campo en una entidad, hay que añadir la
migración a mano **y** cambiar la entidad. Con `validate`, si se cambia solo la
entidad, la aplicación deja de arrancar — que es exactamente lo que se quiere:
que falle en tu máquina y no en producción.