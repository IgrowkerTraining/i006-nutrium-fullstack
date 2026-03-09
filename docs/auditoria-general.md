# Auditoría General del Proyecto Nutrium

> **Fecha:** 25 de febrero de 2026
> **Rol:** Arquitecto de Software / QA Lead
> **Branch auditado:** `feature/nutritionist-endpoints` (fullstack) · `feature/sprint1-integration` (ai)
> **Alcance:** Solo lectura. Sin modificaciones.

---

## 1. Resumen del Proyecto — Arquitectura Actual

### 1.1. Mapa de Servicios (docker-compose.yml raíz)

El archivo principal de orquestación (`docker-compose.yml` en la raíz del monorepo) levanta **5 servicios** en la red `nutrium-network`:

| Servicio         | Imagen / Build                             | Puerto Host | Puerto Interno | BD que usa       |
|------------------|--------------------------------------------|-------------|----------------|------------------|
| `db-node`        | `postgres:15-alpine`                       | **5432**    | 5432           | `nutrium_node_db` |
| `db-ai`          | `postgres:15-alpine`                       | **5433**    | 5432           | `nutrium_ai_db`  |
| `backend-node`   | Build `i006-nutrium-fullstack/apps/backend`| **3000**    | 3000           | `db-node`        |
| `ai-service`     | Build `i006-nutrium-ai`                    | **8000**    | 8000           | `db-ai`          |
| `frontend`       | Build `i006-nutrium-fullstack/apps/frontend`| **5173**   | 5173           | —                |
| `pgadmin` *(opt)*| `dpage/pgadmin4:latest`                    | **5050**    | 80             | — (profile: dev-tools) |

> **Nota arquitectural:** El repositorio `i006-nutrium-fullstack` tiene su propio `docker-compose.yml` interno que solo levanta `backend` y `frontend` SIN base de datos. Para desarrollo integrado con BD se debe usar el `docker-compose.yml` de la raíz del monorepo.

---

### 1.2. Endpoints Principales — Backend Node.js

Base URL: `http://localhost:3000/api`

#### Módulo Auth (`/auth`)
| Método | Ruta            | Autenticación | Descripción                  |
|--------|-----------------|---------------|------------------------------|
| POST   | `/auth/register`| ❌ Pública    | Registra un nuevo usuario     |
| POST   | `/auth/login`   | ❌ Pública    | Login, devuelve JWT           |

#### Módulo Health (`/health`)
| Método | Ruta      | Autenticación | Descripción        |
|--------|-----------|---------------|--------------------|
| GET    | `/health` | ❌ Pública    | Health check del servicio |

#### Módulo Nutricionistas (`/nutritionists`)
| Método | Ruta                      | Autenticación               | Descripción                        |
|--------|---------------------------|-----------------------------|------------------------------------|
| GET    | `/nutritionists`          | ❌ Pública                  | Lista todos los nutricionistas     |
| GET    | `/nutritionists/profile`  | ✅ Bearer + rol `nutritionist` | Obtiene perfil del nutricionista autenticado |
| PUT    | `/nutritionists/profile`  | ✅ Bearer + rol `nutritionist` | Crea o actualiza el perfil         |
| POST   | `/nutritionists/availability` | ✅ Bearer + rol `nutritionist` | Gestiona franjas horarias      |

#### Módulo Pacientes (`/patients`) — Nuevo módulo Sprint 1
| Método | Ruta                  | Autenticación       | Descripción                              |
|--------|-----------------------|---------------------|------------------------------------------|
| GET    | `/patients/profile`   | ✅ Bearer (cualquier rol) | Obtiene perfil del paciente autenticado |
| POST   | `/patients/profile`   | ✅ Bearer (cualquier rol) | Crea o actualiza el perfil del paciente |
| GET    | `/patients/tags`      | ✅ Bearer (cualquier rol) | Obtiene condiciones de salud del paciente |
| POST   | `/patients/tags`      | ✅ Bearer (cualquier rol) | Actualiza condiciones de salud          |

#### Servicio IA — FastAPI (`http://localhost:8000/api/v1`)
| Módulo | Prefijo base              |
|--------|---------------------------|
| Chat   | `/api/v1/chat`            |
| Health | `/api/v1/health`          |
| Match  | `/api/v1/match`           |

---

## 2. Guía de Ejecución (Runbook)

### Prerrequisitos
- Docker Desktop instalado y corriendo
- Node.js >= 18 y pnpm instalados (para desarrollo local sin Docker)
- Git

### Opción A — Levantar con Docker (Recomendado para integración completa)

```bash
# 1. Clonar los submódulos o estar en la raíz del monorepo
cd d:\Proyectos\Nutriom\proyecto

# 2. Copiar y configurar variables de entorno
#    (el docker-compose.yml raíz usa variables del entorno del shell)
copy i006-nutrium-fullstack\apps\backend\.env.example i006-nutrium-fullstack\apps\backend\.env
copy i006-nutrium-ai\env.example i006-nutrium-ai\.env

# Editar .env del backend con los valores correctos
# Editar .env del AI service con tu OPENROUTER_API_KEY real

# 3. Construir imágenes y levantar todos los servicios
docker compose up --build

# Solo las BDs primero (si se quiere verificar el esquema):
docker compose up db-node db-ai --build

# 4. Para incluir pgAdmin (herramienta visual de BD):
docker compose --profile dev-tools up --build

# 5. Verificar que los servicios están healthy
docker compose ps

# 6. URLs disponibles:
#    Frontend:  http://localhost:5173
#    Backend:   http://localhost:3000/api/health
#    AI:        http://localhost:8000/api/v1/health
#    pgAdmin:   http://localhost:5050  (solo con --profile dev-tools)
```

### Opción B — Desarrollo local sin Docker (solo Frontend + Backend)

```bash
# --- Backend ---
cd i006-nutrium-fullstack
pnpm install          # o: cd apps/backend && npm install

# Asegurarse de tener una instancia de PostgreSQL corriendo en puerto 5432
# con la BD nutrium_node_db inicializada con Nutriom.sql

cd apps/backend
cp .env.example .env
# Editar .env con los valores correctos de tu BD local
npm run dev           # Inicia con nodemon en puerto 3000

# --- Frontend (otra terminal) ---
cd i006-nutrium-fullstack/apps/frontend
pnpm install
npm run dev           # Inicia Vite en puerto 5173

# --- AI Service (otra terminal, requiere Python 3.11+) ---
cd i006-nutrium-ai
pip install -r requirements.txt
cp env.example .env
# Editar .env con OPENROUTER_API_KEY y datos de BD
python main.py        # Inicia FastAPI en puerto 8000
```

### Inicializar la Base de Datos manualmente

```bash
# Conectarse a db-node (si ya está corriendo en Docker)
docker exec -it nutrium-db-node psql -U nutrium_node_user -d nutrium_node_db

# O aplicar el SQL directamente:
docker exec -i nutrium-db-node psql -U nutrium_node_user -d nutrium_node_db \
  < docker-entrypoint-initdb.d/Nutriom.sql
```

---

## 3. Detección de Inconsistencias (El Audit)

### 🔴 CRÍTICO 1 — El modelo `Patient.js` apunta a la tabla equivocada

**Archivo:** `apps/backend/src/models/Patient.js` — línea `tableName: 'patients'`

El modelo Sequelize está configurado con `tableName: 'patients'`, pero la tabla definida en `Nutriom.sql` es **`patient_profiles`**.

```js
// Patient.js (línea ~190) — INCORRECTO
{
  sequelize,
  modelName: 'Patient',
  tableName: 'patients',   // ← TABLA QUE NO EXISTE EN EL SQL
  timestamps: true,
  underscored: true,
}
```

```sql
-- Nutriom.sql — La tabla REAL
CREATE TABLE patient_profiles (  -- ← Este es el nombre correcto
    id BIGSERIAL PRIMARY KEY,
    ...
);
```

**Impacto:** Sequelize intentará operar sobre `patients` y fallará con error `relation "patients" does not exist`.

---

### 🔴 CRÍTICO 2 — Tipo de `id` del paciente: UUID vs BIGSERIAL

**Archivo:** `apps/backend/src/models/Patient.js` — campo `id`

El modelo define `id` como `DataTypes.UUID` con valor por defecto `UUIDV4`, pero la tabla `patient_profiles` en SQL usa `id BIGSERIAL PRIMARY KEY` (entero autoincremental).

| Elemento         | Modelo Sequelize         | Tabla SQL (`patient_profiles`) |
|------------------|--------------------------|-------------------------------|
| `id` tipo        | `UUID` (v4)              | `BIGSERIAL` (BIGINT)          |
| `id` default     | `UUIDV4` generado por JS | Auto-generado por PostgreSQL  |

**Impacto:** Inserción fallará con error de tipo (`invalid input syntax for type bigint`).

---

### 🔴 CRÍTICO 3 — Campos del modelo `Patient.js` no existen en `patient_profiles`

La tabla `patient_profiles` del SQL tiene **solo 5 columnas de datos**: `user_id`, `birth_date`, `gender`, `health_goals`, `created_at`. El modelo Sequelize define **11+ campos** que no existen en esa tabla:

| Campo en `Patient.js`       | Columna SQL esperada   | ¿Existe en `patient_profiles`? |
|-----------------------------|------------------------|-------------------------------|
| `userId` → `user_id`        | `user_id`              | ✅ Sí                         |
| `fechaNacimiento` → `date_of_birth` | `birth_date`   | ⚠️ **Nombre diferente** (SQL: `birth_date`) |
| `nombreCompleto` → `full_name` | —                   | ❌ **No existe**              |
| `pais` → `country`          | —                      | ❌ **No existe**              |
| `ciudad` → `city`           | —                      | ❌ **No existe**              |
| `modalidad`                 | —                      | ❌ **No existe**              |
| `disponibilidad`            | —                      | ❌ **No existe**              |
| `objetivo`                  | —                      | ❌ **No existe**              |
| `condiciones`               | —                      | ❌ **No existe**              |
| `otraCondicion` → `other_condition` | —              | ❌ **No existe**              |
| `gender`                    | `gender`               | ✅ Sí (pero no está en el modelo) |
| `health_goals`              | `health_goals`         | ✅ Sí (pero no está en el modelo) |
| `updatedAt` → `updated_at`  | —                      | ❌ **No existe** en `patient_profiles` |

**Conclusión:** El modelo y el esquema SQL fueron desarrollados de forma **completamente desacoplada**. El modelo asume una tabla `patients` con diseño propio, mientras que el SQL define `patient_profiles` con estructura diferente.

---

### 🔴 CRÍTICO 4 — `Patient` no está registrado en `models/index.js`

**Archivo:** `apps/backend/src/models/index.js`

El archivo central de modelos y asociaciones **no importa ni exporta el modelo `Patient`**, lo que tiene dos consecuencias:

1. La relación N:M `Patient ↔ ClinicalTag` (tabla pivote `patient_tags` del SQL) **nunca se define en Sequelize**.
2. El error ya conocido de `created_at` en tablas pivote podría reproducirse si se intentara definir esta relación, ya que `patient_tags` sí tiene `created_at` y `updated_at`.

```js
// models/index.js — Patient está AUSENTE
const User               = require('./User');
const NutritionistProfile = require('./NutritionistProfile');
const ClinicalTag        = require('./ClinicalTag');
const Availability       = require('./Availability');
// ← Falta: const Patient = require('./Patient');
```

**Para la relación N:M de `patient_tags`**, cuando se implemente, debe seguir el mismo patrón ya funcional de `nutritionist_tags`, usando la opción `timestamps: false` en el `through`, ya que Sequelize por defecto intentaría gestionar `createdAt`/`updatedAt` en la tabla pivote:

```js
// Patrón correcto para evitar el error de created_at en tablas pivote:
Patient.belongsToMany(ClinicalTag, {
  through: { model: 'patient_tags', timestamps: false },
  foreignKey: 'patient_id',
  otherKey: 'tag_id',
  as: 'tags',
});
```

> ⚠️ **Atención:** La tabla `patient_tags` en el SQL **sí tiene** `created_at` y `updated_at`, pero Sequelize busca `createdAt` (camelCase) por defecto. Usando `timestamps: false` en el `through` se evita el conflicto, o alternativamente configurar `underscored: true` en la definición del modelo de la tabla pivote.

---

### 🟠 IMPORTANTE 5 — Middleware de autenticación inconsistente (dos implementaciones)

El proyecto tiene **dos middlewares de autenticación con comportamientos distintos** que se usan en distintos módulos:

| Módulo          | Middleware usado       | Archivo                         | Comportamiento                                  |
|-----------------|------------------------|---------------------------------|-------------------------------------------------|
| Nutricionistas  | `authenticate`         | `middleware/auth.js`            | Verifica JWT real con `jsonwebtoken`            |
| Pacientes       | `authenticateUser`     | `middleware/authMiddleware.js`  | **¡MOCK!** Usa el token como `userId` directamente |

`authMiddleware.js` línea clave:
```js
// TODO: En producción, verificar JWT real con jwt.verify()
req.user = {
  id: token, // el token sin verificar se usa como ID de usuario
};
```

**Impacto:** Cualquier string pasado como Bearer token se acepta como válido en los endpoints de pacientes, haciendo las rutas de pacientes **completamente inseguras**.

---

### 🟠 IMPORTANTE 6 — Rutas del Frontend que no llaman a la API de Pacientes

**Archivos:** `apps/frontend/src/constants/routes.ts` y `apps/frontend/src/services/api.ts`

El frontend tiene páginas de cuestionario (`/cuestionario-personal`, `/cuestionario-salud`) y match, pero:

1. `API_ENDPOINTS` en `constants/routes.ts` solo define endpoints de `Auth` y `Health`. **No hay entradas para `/patients` ni `/nutritionists`**.
2. `apps/frontend/src/services/api.ts` solo implementa `register`, `login`, `checkHealth`.
3. `CuestionarioPersonal.tsx` y `CuestionarioSalud.tsx` son páginas **placeholder sin ninguna llamada a la API** — solo tienen botones de navegación.
4. La variable de entorno `VITE_AI_SERVICE_URL` está configurada en `docker-compose.yml` pero **no se consume en ningún lugar del frontend**.

**Rutas del backend que no tienen contraparte en el frontend actualmente:**
- `POST /api/patients/profile`
- `POST /api/patients/tags`
- `GET /api/patients/profile`
- `GET /api/patients/tags`
- `GET /api/nutritionists`
- `PUT /api/nutritionists/profile`
- `POST /api/nutritionists/availability`

---

### 🟡 MENOR 7 — Variables de entorno faltantes en `.env.example`

#### Backend (`apps/backend/.env.example`)

Las variables definidas en el archivo son mínimas. Faltan variables que el backend sí consume (via `docker-compose.yml` y `database.js`):

| Variable             | ¿En `.env.example`? | ¿Usada en el código/compose? |
|----------------------|---------------------|------------------------------|
| `DB_HOST`            | ✅ Sí               | ✅ database.js               |
| `DB_USER`            | ✅ Sí               | ✅ database.js               |
| `DB_PASS`            | ✅ Sí               | ✅ database.js               |
| `DB_NAME`            | ✅ Sí               | ✅ database.js               |
| `DB_PORT`            | ✅ Sí               | ✅ database.js               |
| `JWT_SECRET`         | ✅ Sí               | ✅ auth.js                   |
| `NODE_ENV`           | ❌ **Falta**        | ✅ docker-compose.yml        |
| `PORT`               | ❌ **Falta**        | ✅ docker-compose.yml        |
| `JWT_EXPIRES_IN`     | ❌ **Falta**        | ✅ docker-compose.yml (`7d`) |
| `AI_SERVICE_URL`     | ❌ **Falta**        | ✅ docker-compose.yml        |
| `DATABASE_URL`       | ❌ **Falta**        | ✅ docker-compose.yml (alternativa a las vars individuales) |

#### AI Service (`i006-nutrium-ai/env.example`)

Faltan todas las variables de conexión a la base de datos que sí están definidas en el `docker-compose.yml` raíz:

| Variable             | ¿En `env.example`? | ¿Usada en docker-compose.yml? |
|----------------------|--------------------|-------------------------------|
| `OPENROUTER_API_KEY` | ✅ Sí              | ✅ Sí                         |
| `OPENROUTER_BASE_URL`| ✅ Sí              | ✅ Sí                         |
| `DB_HOST`            | ❌ **Falta**       | ✅ Sí (`db-ai`)               |
| `DB_USER`            | ❌ **Falta**       | ✅ Sí                         |
| `DB_PASS`            | ❌ **Falta**       | ✅ Sí                         |
| `DB_NAME`            | ❌ **Falta**       | ✅ Sí                         |
| `DB_PORT`            | ❌ **Falta**       | ✅ Sí                         |
| `DATABASE_URL`       | ❌ **Falta**       | ✅ Sí                         |
| `APP_NAME`           | ✅ Sí              | ✅ Sí                         |
| `APP_VERSION`        | ✅ Sí              | ✅ Sí                         |
| `DEBUG`              | ✅ Sí              | ✅ Sí                         |
| `CORS_ORIGINS`       | ✅ Sí (con `["*"]`)| ✅ Sí (con valor más restrictivo en compose) |

---

### 🟡 MENOR 8 — Relaciones N:M de `nutritionist_tags` no configuran `timestamps` explícitamente

**Archivo:** `apps/backend/src/models/index.js`

La relación ya funcional de `NutritionistProfile ↔ ClinicalTag` usa `through: 'nutritionist_tags'` como string. La tabla SQL `nutritionist_tags` tiene columnas `created_at` y `updated_at`.

Sequelize 6 con `through` como string y sin `timestamps: false` puede generar errores al intentar gestionar `createdAt`/`updatedAt` en la tabla pivote si no está configurado `underscored: true` globalmente. Esto es el error que ya se solucionó anteriormente. Se recomienda **documentar explícitamente** la configuración que lo resolvió.

---

## Tabla Resumen de Hallazgos

| # | Severidad | Módulo           | Descripción                                                        | Acción Requerida |
|---|-----------|------------------|--------------------------------------------------------------------|------------------|
| 1 | 🔴 CRÍTICO | Patient (Backend)| `tableName: 'patients'` pero SQL define `patient_profiles`         | Alinear nombre   |
| 2 | 🔴 CRÍTICO | Patient (Backend)| `id` es `UUID` en modelo pero `BIGSERIAL` en SQL                   | Alinear tipos    |
| 3 | 🔴 CRÍTICO | Patient (Backend)| 8+ campos del modelo no existen en la tabla SQL                    | Alinear esquema  |
| 4 | 🔴 CRÍTICO | models/index.js  | `Patient` no registrado, relación `patient_tags` sin definir       | Agregar modelo y relaciones |
| 5 | 🟠 IMPORT. | Auth Middleware  | Dos middlewares inconsistentes; pacientes usan mock sin validación JWT | Unificar en un solo middleware real |
| 6 | 🟠 IMPORT. | Frontend         | Páginas de cuestionario son placeholders sin llamadas a la API     | Implementar integración |
| 7 | 🟡 MENOR   | .env.example     | Faltan `NODE_ENV`, `PORT`, `JWT_EXPIRES_IN`, `AI_SERVICE_URL` en backend; faltan todas las vars de BD en AI service | Completar archivos de ejemplo |
| 8 | 🟡 MENOR   | nutritionist_tags| Configuración de `timestamps` en tabla pivote no documentada explícitamente | Documentar / agregar `timestamps: false` |
