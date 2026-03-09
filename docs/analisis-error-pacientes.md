# Análisis de Error: `relation "patients" does not exist`

**Endpoint afectado:** `PUT /api/v1/patients/profile`  
**Archivos analizados:** `Patient.js`, `patientController.js`, `patientService.js`, `Nutriom.sql`  
**Fecha de análisis:** 2026-02-25

---

## 1. Causa Raíz

Cuando Sequelize intenta ejecutar cualquier operación sobre el modelo `Patient`, construye una sentencia SQL apuntando a la tabla que figura en la opción `tableName` de la configuración del modelo. En `Patient.js`, al final del archivo, dicha opción está declarada así:

```javascript
{
  sequelize,
  modelName: 'Patient',
  tableName: 'patients',   // ← AQUÍ está el problema
  timestamps: true,
  underscored: true,
}
```

La tabla real que provee el esquema `Nutriom.sql` **no se llama `patients`**, sino `patient_profiles`:

```sql
-- Nutriom.sql, línea 22
CREATE TABLE patient_profiles (
    id BIGSERIAL PRIMARY KEY,
    ...
);
```

Por eso PostgreSQL responde literalmente con:

```
ERROR: relation "patients" does not exist
```

Sequence de eventos:

1. El controlador recibe la solicitud HTTP.
2. `patientService.upsertProfile()` llama a `Patient.findOrCreate({ where: { userId } })`.
3. Sequelize genera `SELECT * FROM "patients" WHERE "user_id" = $1`.
4. PostgreSQL busca la relación `patients` en el catálogo del sistema, no la encuentra y lanza la excepción.

El modelo nunca llega a tocar ni validad datos: falla en la construcción de la consulta SQL, antes de cualquier lógica de negocio.

---

## 2. Incompatibilidad del Payload

La tabla real `patient_profiles` tiene **5 columnas de datos** (sin contar `id` y `created_at`). El modelo define **10 campos** con nombres completamente distintos. La tabla siguiente compara el JSON que el controlador acepta/envía al servicio, la columna destino que Sequelize intentaría escribir, y lo que realmente existe en el esquema SQL.

| Campo en el payload (req.body) | Columna que genera Sequelize (tras `field` mapping) | ¿Existe en `patient_profiles`? | Columna real en `patient_profiles` |
|---|---|---|---|
| `nombreCompleto` | `full_name` | ❌ No existe | — |
| `fechaNacimiento` | `date_of_birth` | ❌ No existe | `birth_date` |
| `pais` | `country` | ❌ No existe | — |
| `ciudad` | `city` | ❌ No existe | — |
| `modalidad` | `modalidad` | ❌ No existe | — |
| `disponibilidad` | `disponibilidad` | ❌ No existe | — |
| `objetivo` | `objetivo` | ❌ No existe | `health_goals` (TEXT) |
| `condiciones` (tags) | `condiciones` (ARRAY) | ❌ No existe | Tabla separada `patient_tags` |
| _(no contemplado)_ | — | — | `gender VARCHAR(50)` |
| _(no contemplado)_ | — | — | `user_id UUID` |

> **Resumen:** de los 8 campos que el payload envía, **ninguno** coincide exactamente con una columna de `patient_profiles`. En el mejor caso, algunos conceptos existen con nombres distintos (`date_of_birth` vs `birth_date`, `objetivo` vs `health_goals`). Además, la columna `gender` del esquema real no está modelada en absoluto.

Los valores que están en `patient_tags` (una tabla relacional muchos-a-muchos entre `patient_profiles` y `clinical_tags`) el modelo los trata como si fueran un array plano dentro de la misma tabla, lo cual es una diferencia arquitectónica de fondo, no solo de nombres.

---

## 3. El Problema de la Primary Key

Hay una contradicción directa entre el tipo de dato del `id` en el modelo y el del esquema SQL.

| Aspecto | `Patient.js` (Sequelize) | `Nutriom.sql` |
|---|---|---|
| Tipo de `id` | `DataTypes.UUID` con `defaultValue: DataTypes.UUIDV4` | `BIGSERIAL PRIMARY KEY` (entero autoincremental) |
| Generación del `id` | El ORM genera un UUID v4 en la capa de aplicación | PostgreSQL genera un `BIGINT` con `SERIAL` en la base de datos |
| Tipo de dato en FK | `userId: DataTypes.UUID` (referencia a `users.id`) | `user_id UUID NOT NULL REFERENCES users(id)` |

La clave foránea `user_id` coincide conceptualmente (ambos apuntan a `users.id` que sí es `UUID`), pero la Primary Key del propio registro de perfil es **completamente incompatible**: el modelo intentaría insertar un `UUID` como `id` donde la base de datos espera que `id` sea un `BIGINT` autoincremental generado por la secuencia interna de PostgreSQL.

Esto provocaría un segundo error en cascada —incluso si se corrigiera el `tableName`— porque Sequelize incluiría el campo `id` en el `INSERT`, violando la restricción de tipo de la columna `BIGSERIAL`.

---

## 4. Conclusión Arquitectónica

El modelo `Patient.js` fue construido de forma **completamente aislada del contrato de base de datos** definido en `Nutriom.sql`. Los problemas no son puntuales sino sistémicos:

1. **Desconexión de nombre de tabla:** `tableName: 'patients'` vs `patient_profiles`. El modelo nunca puede alcanzar la tabla real.

2. **Diseño de columnas inventado:** El desarrollador diseñó columnas en español (`modalidad`, `disponibilidad`, `objetivo`) y en inglés con mapeo (`full_name`, `date_of_birth`, `country`, `city`) que no existen en el esquema acordado. La tabla real es minimalista y delega los objetivos, condiciones y disponibilidad a otras tablas relacionales.

3. **Primary Key de tipo incorrecto:** El modelo asume un esquema UUID como PK, el esquema SQL usa un entero autoincremental (`BIGSERIAL`). Ambos enfoques son válidos de forma aislada, pero son mutuamente excluyentes sin una migración o un rediseño explícito.

4. **Aplanamiento de relaciones:** Los `condiciones` (etiquetas de salud) pertenecen a la tabla `patient_tags` con su propio catálogo `clinical_tags`. El modelo los reduce a un `ARRAY(DataTypes.STRING)` dentro de la misma fila, eliminando toda la integridad referencial que el esquema SQL garantiza.

5. **Columna `gender` ignorada:** El esquema SQL incluye `gender VARCHAR(50)`, que no tiene ningún campo correspondiente en el modelo ni en el payload del controlador.

El resultado es que la capa de aplicación y la capa de datos hablan idiomas distintos. La corrección requerirá:
- Renombrar `tableName` a `'patient_profiles'`.
- Cambiar la PK a `DataTypes.BIGINT` con `autoIncrement: true`.
- Renombrar o eliminar los campos del modelo para que coincidan con las columnas reales (`birth_date`, `health_goals`, `gender`).
- Eliminar los campos inexistentes (`country`, `city`, `modalidad`, `disponibilidad`, `full_name`).
- Modelar las condiciones de salud a través de la relación `patient_tags` ↔ `clinical_tags`, no como un array plano.
