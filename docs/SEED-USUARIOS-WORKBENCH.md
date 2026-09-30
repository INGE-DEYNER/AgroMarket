# SEED — 3 usuarios reales (Workbench)

> Base: MySQL `agromarket` (Docker: puerto `3307`, local: `3306`).
> Tabla: `users` (`UserEntity.java`, PK `IDENTITY/AUTO_INCREMENT`). Roles: `BUYER | PRODUCER | ADMIN` (`Role.java`).
> Passwords con **BCrypt** (`BCryptPasswordHashAdapter.java` = `BCryptPasswordEncoder`, cost 10).
> La semilla usa `Asafrut2026*`; el bloque de la sección C ya incluye un hash BCrypt válido.

---

## A) Conexión Workbench (usa esta)

| Campo | Valor Docker (actual) | Valor si paras MySQL80 local |
|---|---|---|
| Host | `127.0.0.1` | `127.0.0.1` |
| Port | `3307` | `3306` |
| User | `agromarket` (o `root`) | igual |
| Password | `agromarket` (o `root123`) | igual |
| Schema | `agromarket` | `agromarket` |

```sql
USE agromarket;
SELECT id, first_name, last_name, email, role FROM users ORDER BY id;
```

---

## B) Resultado esperado

Después de ejecutar el bloque C, la consulta debe mostrar exactamente:

| id | email | role |
|---:|---|---|
| 0 | deyner.ingsoftware@gmail.com | ADMIN |
| 1 | rosamariavivas45@gmail.com | BUYER |
| 2 | marlenispalacios376@gmail.com | PRODUCER |

El `AUTO_INCREMENT` queda en `3`; por eso el siguiente usuario creado sin especificar ID será `3`.

---

## C) RESET + RE-SEED en una sola ejecución (Workbench)

> ⚠️ Ejecuta este bloque solo cuando la tabla `users` tenga únicamente los tres usuarios de esta semilla.
> Deja `0=ADMIN, 1=BUYER, 2=PRODUCER`; el siguiente usuario automático será `id=3`.
> Contraseña de los tres usuarios: `Asafrut2026*`. Cámbiala antes de usar un ambiente real.

```sql
USE agromarket;

-- Permite guardar explícitamente el id=0 y usarlo para los siguientes INSERT automáticos.
SET SESSION sql_mode = CONCAT_WS(',', @@SESSION.sql_mode, 'NO_AUTO_VALUE_ON_ZERO');

-- Elimina primero el perfil administrativo y después los usuarios de esta semilla.
DELETE FROM admins
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE email IN (
    'deyner.ingsoftware@gmail.com',
    'rosamariavivas45@gmail.com',
    'marlenispalacios376@gmail.com'
  )
);

DELETE FROM users
WHERE email IN (
  'deyner.ingsoftware@gmail.com',
  'rosamariavivas45@gmail.com',
  'marlenispalacios376@gmail.com'
);

-- Un solo INSERT: Administrador, Comprador y Productor.
-- Columnas según el modelo UNIFICADO de `users`:
--   * No existe `approved` (unificado en `account_approved`).
--   * No existe `verified_producer` (unificado en `account_approved`).
--   * No existen `account_status` ni `account_complete` (derivados).
--   * No existe `registration_date` (unificado en `created_at`).
--   * No existe `location` (unificado en `department` + `city`).
--   * No existen `average_rating` ni `total_reviews` (se calculan de `reviews`).
--   * No existe `is_company` (derivado de `company_name`).
INSERT INTO users
  (id, first_name, last_name, email, password, phone, role,
   active, totp_enabled, provider, email_verified, country_code,
   department, city, preferred_currency,
   created_at, updated_at, account_approved)
VALUES
  (0, 'Deyner', 'Chaverra', 'deyner.ingsoftware@gmail.com',
   '$2a$10$6jOcBhYcbZVPhOgb19i4Xepp6sRNgrzhJNWxNK88EfxqUOlGfvXuG',
   '+573001234567', 'ADMIN',
   1, 0, 'local', 1, '+57',
   'Antioquia', 'Chigorodó', 'COP',
   NOW(), NOW(), 1),

  (1, 'Rosa', 'Maria Vivas', 'rosamariavivas45@gmail.com',
   '$2a$10$6jOcBhYcbZVPhOgb19i4Xepp6sRNgrzhJNWxNK88EfxqUOlGfvXuG',
   '+573001234568', 'BUYER',
   1, 0, 'local', 1, '+57',
   'Antioquia', 'Apartadó', 'COP',
   NOW(), NOW(), 1),

  (2, 'Marlenis', 'Palacios', 'marlenispalacios376@gmail.com',
   '$2a$10$6jOcBhYcbZVPhOgb19i4Xepp6sRNgrzhJNWxNK88EfxqUOlGfvXuG',
   '+573001234569', 'PRODUCER',
   1, 0, 'local', 1, '+57',
   'Antioquia', 'Turbo', 'COP',
   NOW(), NOW(), 1);

-- El siguiente INSERT que omita id usará automáticamente 3, 4, 5...
ALTER TABLE users AUTO_INCREMENT = 3;

-- Perfil administrativo requerido por el backend.
INSERT INTO admins (user_id, user_name, active, created_at)
VALUES (0, 'Deyner Chaverra', 1, NOW())
ON DUPLICATE KEY UPDATE
  user_name = 'Deyner Chaverra',
  active = 1;

-- Comprobación: debe mostrar 0=ADMIN, 1=BUYER y 2=PRODUCER.
SELECT id, first_name, last_name, email, role
FROM users
ORDER BY id;

SELECT a.id, a.user_id, a.user_name, u.email
FROM admins a
JOIN users u ON u.id = a.user_id;
```
