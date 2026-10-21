-- Migración 001: canchas.zona y canchas.email_contacto.
--
-- Reglas de las migraciones (las aplica scripts/deploy.sh en cada despliegue, una sola vez cada una):
--   * Deben ser IDEMPOTENTES (IF NOT EXISTS, UPDATE ... WHERE ... IS NULL): también se corren contra
--     bases que ya tenían el cambio aplicado a mano.
--   * Solo cambios ADITIVOS (columnas/tablas nuevas). Borrar o renombrar algo rompería a la versión
--     anterior durante el rollback; eso se hace en dos despliegues (primero el código, después el DROP).
--   * Todo cambio de esquema se refleja también en database/schema.sql (instalaciones nuevas).
--   * Nombre: NNN_descripcion.sql; se aplican en orden alfabético.

ALTER TABLE canchas ADD COLUMN IF NOT EXISTS zona VARCHAR(60) NULL;
ALTER TABLE canchas ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(120) NULL;

UPDATE canchas SET zona = 'Caballito'     WHERE zona IS NULL AND descripcion ILIKE '%Caballito%';
UPDATE canchas SET zona = 'Villa Urquiza' WHERE zona IS NULL AND descripcion ILIKE '%Villa Urquiza%';
UPDATE canchas SET zona = 'Chacarita'     WHERE zona IS NULL AND descripcion ILIKE '%Chacarita%';
UPDATE canchas SET zona = 'Colegiales'    WHERE zona IS NULL AND descripcion ILIKE '%Colegiales%';
