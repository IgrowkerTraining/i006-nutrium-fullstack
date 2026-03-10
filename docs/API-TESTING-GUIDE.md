# Guía de Pruebas API (E2E) — Nutriom Backend

> **Estado:** MVP congelado para batería de pruebas manuales  
> **Herramientas recomendadas:** Postman / Thunder Client  
> **Base URL:** `http://localhost:3000/api/v1`  
> **Fecha de generación:** 2026-03-05

---

## Índice

1. [Convenciones Globales](#1-convenciones-globales)
2. [Módulo: Auth](#2-módulo-auth)
3. [Módulo: Patients](#3-módulo-patients)
4. [Módulo: Nutritionists](#4-módulo-nutritionists)
5. [⭐ Módulo: Availability (lógica compleja)](#5-módulo-availability-lógica-compleja)
6. [⭐ Módulo: Appointments (lógica compleja)](#6-módulo-appointments-lógica-compleja)
7. [Orden de Ejecución Recomendado](#7-orden-de-ejecución-recomendado)

---

## 1. Convenciones Globales

| Concepto | Detalle |
|---|---|
| Autenticación | `Authorization: Bearer <JWT>` en el header de cada petición protegida |
| Formato de fecha | `YYYY-MM-DD` (ej: `2026-04-15`) |
| Formato de hora | `HH:mm` o `HH:mm:ss` (ej: `09:00` o `09:00:00`) |
| UUIDs | Todos los IDs son UUID v4 (ej: `a1b2c3d4-e5f6-...`) |
| Roles válidos | `patient` · `nutritionist` |
| Respuesta exitosa | `{ "success": true, "message": "...", "data": { ... } }` |
| Respuesta de error | `{ "success": false, "message": "...", "errors": [...] }` |

### Variables de Entorno sugeridas para Postman

```
BASE_URL = http://localhost:3000/api/v1
TOKEN_PATIENT = <JWT del paciente>
TOKEN_NUTRITIONIST = <JWT del nutricionista>
PATIENT_ID = <UUID del usuario paciente>
NUTRITIONIST_ID = <UUID del usuario nutricionista>
APPOINTMENT_ID = <UUID de una cita creada>
```

---

## 2. Módulo: Auth

> **Prefijo de ruta:** `/api/v1/auth`  
> **Archivo de rutas:** `src/routes/auth.js`  
> **Controlador:** `src/controllers/authController.js`  
> **Servicio:** `src/services/userService.js`

---

### 2.1 Registro de usuario

**Endpoint:** `POST /api/v1/auth/register`  
**Auth Requerida:** No

#### Body de Prueba — Paciente

```json
{
  "name": "Laura García",
  "email": "laura.garcia@example.com",
  "password": "MiPassword123!",
  "role": "patient"
}
```

#### Body de Prueba — Nutricionista

```json
{
  "name": "Dr. Carlos Ruiz",
  "email": "carlos.ruiz@nutriom.com",
  "password": "NutriSecure456!",
  "role": "nutritionist"
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Registro exitoso como `patient` | Body válido con `role: "patient"` | `201` — `{ success: true, data: { user: {...} } }` — devuelve usuario **sin** `password_hash` |
| 2 | ✅ **Caso Feliz** | Registro exitoso como `nutritionist` | Body válido con `role: "nutritionist"` | `201` — igual que arriba |
| 3 | ✅ **Caso Feliz** | Registro sin `role` (default `patient`) | Body sin campo `role` | `201` — usuario creado con `role: "patient"` |
| 4 | ❌ **Negativo** | Falta `name` | Omitir campo `name` | `400` — `"Los campos nombre, email y contraseña son requeridos"` |
| 5 | ❌ **Negativo** | Falta `email` | Omitir campo `email` | `400` — mismo mensaje |
| 6 | ❌ **Negativo** | Falta `password` | Omitir campo `password` | `400` — mismo mensaje |
| 7 | ❌ **Negativo** | Email ya registrado | Mismo `email` dos veces | `400` — `"El email ya está registrado"` |
| 8 | ❌ **Negativo** | Email con espacios | `"  LAURA@example.com  "` | `400` — email duplicado si ya existe (el sistema normaliza a `laura@example.com`) |

---

### 2.2 Login

**Endpoint:** `POST /api/v1/auth/login`  
**Auth Requerida:** No

#### Body de Prueba

```json
{
  "email": "laura.garcia@example.com",
  "password": "MiPassword123!"
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Login exitoso | Credenciales correctas | `200` — `{ data: { user: {...}, token: "eyJ..." } }` — guardar `token` en variable de entorno |
| 2 | ✅ **Caso Feliz** | Email con mayúsculas / espacios | `"  LAURA.GARCIA@EXAMPLE.COM  "` | `200` — normalizado automáticamente |
| 3 | ❌ **Negativo** | Falta `email` | Omitir campo | `400` — `"Email y contraseña son requeridos"` |
| 4 | ❌ **Negativo** | Falta `password` | Omitir campo | `400` — mismo mensaje |
| 5 | ❌ **Negativo** | Password incorrecta | Contraseña erronea | `401` — `"Email o contraseña inválidos"` |
| 6 | ❌ **Negativo** | Email inexistente | Email no registrado | `401` — `"Email o contraseña inválidos"` *(sin revelar si el email existe)* |
| 7 | ❌ **Negativo** | Cuenta desactivada (`is_active = false`) | Credenciales correctas de cuenta inactiva | `403` — `"Tu cuenta ha sido desactivada. Contacta al administrador."` — *Nota: este mensaje solo aparece DESPUÉS de validar la contraseña correctamente* |

---

## 3. Módulo: Patients

> **Prefijo de ruta:** `/api/v1/patients`  
> **Auth Requerida en todos los endpoints:** Sí — Bearer Token de rol `patient`  
> **Archivo de rutas:** `src/routes/patient.js`  
> **Controlador:** `src/controllers/patientController.js`  
> **Servicio:** `src/services/patientService.js`

---

### 3.1 Obtener perfil del paciente

**Endpoint:** `GET /api/v1/patients/profile`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_PATIENT}}`

#### Casos a Probar

| # | Tipo | Descripción | Respuesta Esperada |
|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Paciente con perfil creado | `200` — devuelve `profile` con array `tags` (puede estar vacío) |
| 2 | ❌ **Negativo** | Paciente sin perfil aún creado | `404` — `"El paciente aún no tiene perfil creado"` |
| 3 | ❌ **Negativo** | Sin token | Omitir header `Authorization` | `401` — rechazado por middleware `authenticate` |
| 4 | ❌ **Negativo** | Token de nutricionista | Usar `TOKEN_NUTRITIONIST` | `401` o `403` según implementación del middleware |

---

### 3.2 Crear / Actualizar perfil del paciente (Upsert)

**Endpoint:** `PUT /api/v1/patients/profile`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_PATIENT}}`

#### Body de Prueba — Creación completa

```json
{
  "birth_date": "1995-08-20",
  "gender": "femenino",
  "health_goals": "Mejorar el sistema digestivo y bajar de peso",
  "languages": ["es", "en"],
  "modality": "online",
  "profile_picture": "https://cdn.example.com/avatars/laura.jpg",
  "country": "Argentina",
  "city": "Buenos Aires",
  "tag_ids": [1, 3]
}
```

#### Body de Prueba — Actualización parcial

```json
{
  "birth_date": "1995-08-20",
  "health_goals": "Solo quiero mejorar digestión",
  "city": "Rosario"
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Primera creación del perfil | Body completo con `birth_date` | `201` — `"Perfil creado exitosamente"` |
| 2 | ✅ **Caso Feliz** | Segunda llamada — actualización | Mismo body o parcial | `200` — `"Perfil actualizado exitosamente"` |
| 3 | ✅ **Caso Feliz** | Con `tag_ids` válidos | `"tag_ids": [1, 3]` | `201/200` — perfil incluye `tags` con los tags asignados |
| 4 | ✅ **Caso Feliz** | Sin `tag_ids` (campo opcional) | Omitir `tag_ids` | `201/200` — perfil sin tags asociados |
| 5 | ❌ **Negativo** | Sin `birth_date` | Omitir campo | `400` — `{ "errors": [{ "field": "birth_date", "message": "..." }] }` |
| 6 | ❌ **Negativo** | `birth_date` con formato inválido | `"birth_date": "20-08-1995"` | `400` — `"birth_date debe ser una fecha válida (YYYY-MM-DD)"` |
| 7 | ❌ **Negativo** | `tag_ids` no es array | `"tag_ids": "1,3"` | `400` — `"tag_ids debe ser un array de IDs numéricos"` |
| 8 | ❌ **Negativo** | `tag_ids` con IDs inexistentes | `"tag_ids": [9999, 8888]` | `400` — `"Uno o más tag_ids son inválidos o no existen"` |
| 9 | ❌ **Negativo** | `languages` no es array | `"languages": "es,en"` | `400` — `"languages debe ser un array de strings"` |

---

## 4. Módulo: Nutritionists

> **Prefijo de ruta:** `/api/v1/nutritionists`  
> **Archivo de rutas:** `src/routes/nutritionists.js`  
> **Controlador:** `src/controllers/nutritionistController.js`  
> **Servicio:** `src/services/nutritionistService.js`

---

### 4.1 Listar nutricionistas (público)

**Endpoint:** `GET /api/v1/nutritionists`  
**Auth Requerida:** **No** (endpoint público)

#### Casos a Probar

| # | Tipo | Descripción | Params | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Lista paginada por defecto | Sin query params | `200` — `{ nutritionists: [...], total: N, page: 1, totalPages: N }` |
| 2 | ✅ **Caso Feliz** | Paginación personalizada | `?page=2&limit=5` | `200` — segunda página con 5 resultados |
| 3 | ✅ **Caso Feliz** | Filtrar por categoría de tag | `?tag=deportiva` | `200` — solo nutricionistas con tag de categoría `deportiva` |
| 4 | ✅ **Caso Feliz** | Filtro sin resultados | `?tag=categoria_inexistente` | `200` — `{ nutritionists: [], total: 0 }` |

---

### 4.2 Obtener perfil del nutricionista autenticado

**Endpoint:** `GET /api/v1/nutritionists/profile`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_NUTRITIONIST}}` + rol `nutritionist`

#### Casos a Probar

| # | Tipo | Descripción | Respuesta Esperada |
|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Nutricionista con perfil | `200` — perfil con arrays `tags` y `availabilities` (franjas activas) |
| 2 | ❌ **Negativo** | Nutricionista sin perfil creado | `404` — `"El nutricionista aún no tiene perfil creado"` |
| 3 | ❌ **Negativo** | Sin token | `401` — middleware rechaza |
| 4 | ❌ **Negativo** | Token de paciente | `403` — middleware `authorize("nutritionist")` rechaza |

---

### 4.3 Crear / Actualizar perfil del nutricionista (Upsert)

**Endpoint:** `PUT /api/v1/nutritionists/profile`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_NUTRITIONIST}}` + rol `nutritionist`

#### Body de Prueba — Creación completa

```json
{
  "license_number": "MP-54321",
  "bio": "Especialista en nutrición deportiva y pérdida de peso sostenible. 8 años de experiencia.",
  "modality": "hibrido",
  "years_of_experience": 8,
  "country": "Argentina",
  "city": "Córdoba",
  "tag_ids": [1, 2, 4]
}
```

#### Body de Prueba — Actualización parcial

```json
{
  "bio": "Actualización: ahora también atiendo virtualmente.",
  "modality": "online",
  "years_of_experience": 9,
  "tag_ids": [1, 2, 4, 5]
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Primera creación | Body completo | `201` — `"Perfil creado exitosamente"` |
| 2 | ✅ **Caso Feliz** | Actualización | Re-enviar body | `200` — `"Perfil actualizado exitosamente"` |
| 3 | ❌ **Negativo** | Sin `license_number` en creación | Omitir campo | `400` — `"license_number es requerido"` |
| 4 | ❌ **Negativo** | Sin `bio` | Omitir campo | `400` — `"bio es requerido"` |
| 5 | ❌ **Negativo** | Sin `modality` | Omitir campo | `400` — `"modality es requerida (online \| presencial \| hibrido)"` |
| 6 | ❌ **Negativo** | Sin `years_of_experience` | Omitir campo | `400` — `"years_of_experience es requerido"` |
| 7 | ❌ **Negativo** | `years_of_experience` negativo | `"years_of_experience": -1` | `400` — `"debe ser un número mayor o igual a 0"` |
| 8 | ❌ **Negativo** | `tag_ids` vacío o ausente en creación | `"tag_ids": []` | `400` — `"tag_ids debe ser un array con al menos un elemento"` |
| 9 | ❌ **Conflicto** | `license_number` ya usado por otro nutricionista | Usar matrícula existente | `409` — `"El número de matrícula ya está registrado"` |
| 10 | ❌ **Negativo** | `tag_ids` con valores inválidos (no enteros) | `"tag_ids": ["abc"]` | `400` — `"tagIds debe ser un array de IDs numéricos enteros positivos"` |
| 11 | ❌ **Negativo** | `tag_ids` con IDs inexistentes | `"tag_ids": [9999]` | `400` — `"Uno o más tagIds son inválidos o no existen"` |

---

## 5. ⭐ Módulo: Availability (lógica compleja)

> **Prefijo de ruta:** `/api/v1/nutritionists` (sub-rutas de disponibilidad)  
> **Auth Requerida en todos:** Sí — `Bearer {{TOKEN_NUTRITIONIST}}` + rol `nutritionist`  
> **Prerrequisito crítico:** El nutricionista **debe tener un perfil creado** antes de gestionar franjas.

> **Convención `day_of_week`:**
> | Valor | Día |
> |---|---|
> | 0 | Domingo |
> | 1 | Lunes |
> | 2 | Martes |
> | 3 | Miércoles |
> | 4 | Jueves |
> | 5 | Viernes |
> | 6 | Sábado |

---

### 5.1 Establecer disponibilidad — Soft Delete (POST)

**Endpoint:** `POST /api/v1/nutritionists/availability`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_NUTRITIONIST}}`

> **Comportamiento:** Desactiva (`is_active = false`) todas las franjas anteriores y crea las nuevas. Las filas antiguas se **conservan** en BD (historial). Usa soft-delete + bulkCreate en una transacción atómica.

#### Body de Prueba

```json
{
  "slots": [
    { "day_of_week": 1, "start_time": "09:00", "end_time": "12:00" },
    { "day_of_week": 1, "start_time": "14:00", "end_time": "18:00" },
    { "day_of_week": 3, "start_time": "10:00", "end_time": "13:00" },
    { "day_of_week": 5, "start_time": "08:00", "end_time": "11:00" }
  ]
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Establecer horario completo | Body con array de 4 slots válidos | `200` — `"Disponibilidad actualizada: 4 franja(s) guardada(s)"` — `data.slots` con las 4 franjas |
| 2 | ✅ **Caso Feliz** | Reemplazar horario existente | Llamar dos veces seguidas | `200` — franjas anteriores marcadas `is_active = false`; nuevas franjas activas |
| 3 | ✅ **Caso Feliz** | Franja duplicada en el array | Mismo slot dos veces en `slots` | `200` — `ignoreDuplicates: true` evita error; solo se inserta una |
| 4 | ❌ **Negativo** | `slots` vacío | `"slots": []` | `400` — `"Debes enviar al menos una franja horaria en el array slots"` |
| 5 | ❌ **Negativo** | `slots` no es array | `"slots": "lunes 9-12"` | `400` — error de validación |
| 6 | ❌ **Negativo** | Slot sin `day_of_week` | `{ "start_time": "09:00", "end_time": "12:00" }` | `400` — `"Cada slot debe tener day_of_week (0-6), start_time y end_time"` |
| 7 | ❌ **Negativo** | Slot sin `start_time` | `{ "day_of_week": 1, "end_time": "12:00" }` | `400` — mismo mensaje |
| 8 | ❌ **Negativo** | `day_of_week` fuera de rango | `{ "day_of_week": 7, ... }` | `400` — `"day_of_week "7" no es válido. Debe ser un entero entre 0 (Domingo) y 6 (Sábado)"` |
| 9 | ❌ **Negativo** | `day_of_week` negativo | `{ "day_of_week": -1, ... }` | `400` — mismo mensaje de rango |
| 10 | ❌ **Negativo** | Nutricionista sin perfil creado | Token válido pero sin PUT /profile previo | `404` — `"Primero debes crear tu perfil (PUT /api/v1/nutritionists/profile)"` |
| 11 | ❌ **Negativo** | Token de paciente | Usar `TOKEN_PATIENT` | `403` — `authorize("nutritionist")` rechaza |

---

### 5.2 Reemplazar disponibilidad — Hard Delete (PUT)

**Endpoint:** `PUT /api/v1/nutritionists/availability`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_NUTRITIONIST}}`

> **Comportamiento:** Elimina **permanentemente** (`Availability.destroy`) todas las franjas y crea las nuevas. La BD queda limpia sin historial. Operación atómica con transacción.  
> **Diferencia clave vs POST:** POST hace soft-delete (conserva historial), PUT hace hard-delete (borra permanentemente).

#### Body de Prueba

```json
{
  "slots": [
    { "day_of_week": 2, "start_time": "09:00", "end_time": "13:00" },
    { "day_of_week": 4, "start_time": "15:00", "end_time": "19:00" }
  ]
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Reemplazo completo | Body con 2 slots válidos | `200` — `"Disponibilidad reemplazada: 2 franja(s) guardada(s)"` |
| 2 | ✅ **Caso Feliz** | Verificar limpieza | `GET /profile` después del PUT | Perfil devuelve **solo** las nuevas 2 franjas (las anteriores ya no existen en BD) |
| 3 | ❌ **Negativo** | `slots` ausente o no array | Omitir campo o enviar string | `400` — `` "`slots` es requerido y debe ser un array" `` |
| 4 | ❌ **Negativo** | Array vacío | `"slots": []` | `400` — `"Debes enviar al menos una franja horaria"` |
| 5 | ❌ **Negativo** | Slot con `day_of_week` string no numérico | `{ "day_of_week": "lunes", ... }` | `400` — error de validación de rango |
| 6 | ❌ **Negativo** | Nutricionista sin perfil | Sin PUT /profile previo | `404` — `"Primero debes crear tu perfil"` |
| 7 | ❌ **Negativo** | Sin token | Sin header Auth | `401` |

---

## 6. ⭐ Módulo: Appointments (lógica compleja)

> **Prefijo de ruta:** `/api/v1/appointments`  
> **Auth Requerida en todos los endpoints:** Sí — `Bearer <token>` (paciente o nutricionista según operación)  
> **Archivo de rutas:** `src/routes/appointments.js`  
> **Controlador:** `src/controllers/appointmentController.js`  
> **Servicio:** `src/services/appointmentService.js`

### Estados de una cita (`status`)

```
pending → confirmed → completed
    ↓
 cancelled  (terminal: no se puede revertir)
```

| Estado | Descripción |
|---|---|
| `pending` | Estado inicial al crear. Única estado **editable** |
| `confirmed` | Confirmada por cualquiera de las partes |
| `completed` | Concluida (set al agregar reseña) |
| `cancelled` | Cancelada. Estado **terminal** — ningún cambio posterior posible |

---

### 6.1 Crear cita

**Endpoint:** `POST /api/v1/appointments`  
**Auth Requerida:** Sí — `Bearer {{TOKEN_PATIENT}}` (debe ser un usuario con rol `patient`)

#### Body de Prueba

```json
{
  "nutritionist_id": "{{NUTRITIONIST_ID}}",
  "appointment_date": "2026-04-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "notes": "Primera consulta. Tengo problemas digestivos."
}
```

#### Casos a Probar

| # | Tipo | Descripción | Payload / Condición | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Crear cita válida | Body completo, fecha futura, sin solapamiento | `201` — `"Cita agendada exitosamente"` — `status: "pending"`, guardar `id` como `APPOINTMENT_ID` |
| 2 | ✅ **Caso Feliz** | Con `notes` vacío | `"notes": ""` o sin `notes` | `201` — `notes` guardado como `null` |
| 3 | ✅ **Caso Feliz** | Horario formato con segundos | `"start_time": "10:00:00"` | `201` — normalizado correctamente |
| 4 | ❌ **Negativo** | Sin `nutritionist_id` | Omitir campo | `400` — `"nutritionist_id es requerido"` |
| 5 | ❌ **Negativo** | Sin `appointment_date` | Omitir campo | `400` — `"appointment_date es requerido (YYYY-MM-DD)"` |
| 6 | ❌ **Negativo** | Sin `start_time` | Omitir campo | `400` — `"start_time es requerido (HH:mm o HH:mm:ss)"` |
| 7 | ❌ **Negativo** | Sin `end_time` | Omitir campo | `400` — `"end_time es requerido (HH:mm o HH:mm:ss)"` |
| 8 | ❌ **420 — Fecha pasada** | `appointment_date` en el pasado | `"appointment_date": "2020-01-01"` | `400` — `"La fecha y hora de la cita deben ser en el futuro"` |
| 9 | ❌ **Fecha hoy en el pasado** | Hora de hoy pero ya pasó | `appointment_date` = hoy, `start_time` = hace 1 hora | `400` — mismo mensaje de fecha futura |
| 10 | ❌ **Negativo** | Formato de fecha inválido | `"appointment_date": "15/04/2026"` | `400` — `"appointment_date debe tener formato YYYY-MM-DD"` |
| 11 | ❌ **Negativo** | Formato de hora inválido | `"start_time": "9am"` | `400` — `"start_time debe tener formato HH:mm o HH:mm:ss"` |
| 12 | ❌ **Negativo** | `start_time >= end_time` | `"start_time": "11:00"`, `"end_time": "10:00"` | `400` — `"start_time debe ser menor que end_time"` |
| 13 | ❌ **Negativo** | `start_time == end_time` | Mismos valores | `400` — mismo mensaje |
| 14 | ❌ **Negativo** | `nutritionist_id` UUID inválido | `"nutritionist_id": "no-es-uuid"` | `400` — `"Formato de UUID inválido en patient_id o nutritionist_id"` (PG code `22P02`) |
| 15 | ❌ **Negativo** | `nutritionist_id` UUID no existente | UUID válido pero no registrado | `404` — `"El nutricionista especificado no existe"` |
| 16 | ❌ **Negativo** | `nutritionist_id` referencia a un `patient` | UUID de un usuario con `role: patient` | `400` — `"El usuario especificado no es un nutricionista"` |
| 17 | ❌ **Negativo** | Usuario autenticado NO es `patient` | Usar `TOKEN_NUTRITIONIST` para crear cita | `400` — `"El usuario autenticado no es un paciente"` |
| 18 | ❌ **409 — Double Booking** | Solapamiento parcial de horario | Crear una 2ª cita con el mismo nutricionista, misma fecha, horario que se solapa con otra activa | `409` — `"El nutricionista ya tiene un turno en ese rango horario"` |
| 19 | ❌ **409 — Double Booking solapamiento inicio** | Nueva cita empieza antes y termina dentro de una existente | Ej: existente `10:00-11:00`, nueva `09:30-10:30` | `409` — mismo mensaje |
| 20 | ❌ **409 — Double Booking solapamiento fin** | Nueva cita empieza dentro y termina después | Ej: existente `10:00-11:00`, nueva `10:30-11:30` | `409` — mismo mensaje |
| 21 | ✅ **No hay solapamiento** | Cita NO se solapa (contigua) | Existente `10:00-11:00`, nueva `11:00-12:00` | `201` — citas contiguas son válidas |

---

### 6.2 Obtener mi calendario

**Endpoint:** `GET /api/v1/appointments/my-calendar`  
**Auth Requerida:** Sí — `Bearer <token>` (cualquier rol)

> **Comportamiento:** Si el token es de `patient`, devuelve sus citas como paciente. Si es `nutritionist`, devuelve sus citas como profesional. Ordenado por fecha y hora ascendente.

#### Casos a Probar

| # | Tipo | Descripción | Token | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Calendario del paciente | `TOKEN_PATIENT` | `200` — array de citas donde `patient_id = PATIENT_ID`, incluye datos del nutricionista |
| 2 | ✅ **Caso Feliz** | Calendario del nutricionista | `TOKEN_NUTRITIONIST` | `200` — array de citas donde `nutritionist_id` coincide, incluye datos del paciente |
| 3 | ✅ **Caso Feliz** | Sin citas | Token válido sin citas | `200` — `data.appointments: []` array vacío |
| 4 | ❌ **Negativo** | Sin token | Sin header Auth | `401` |

---

### 6.3 Obtener cita por ID

**Endpoint:** `GET /api/v1/appointments/:id`  
**Auth Requerida:** Sí — `Bearer <token>` (paciente o nutricionista de la cita)

#### Casos a Probar

| # | Tipo | Descripción | Condición | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Obtener cita propia (paciente) | `TOKEN_PATIENT` y `APPOINTMENT_ID` válido | `200` — objeto de cita completo con datos del paciente y nutricionista |
| 2 | ✅ **Caso Feliz** | Obtener cita propia (nutricionista) | `TOKEN_NUTRITIONIST` y el mismo `APPOINTMENT_ID` | `200` — misma respuesta |
| 3 | ❌ **Negativo** | ID no existente | UUID válido pero sin cita | `404` — `"La cita especificada no existe"` |
| 4 | ❌ **Negativo** | UUID con formato inválido | `GET /appointments/no-es-uuid` | `400` — error de BD con PG code `22P02` |
| 5 | ❌ **Negativo** | Cita existe pero pertenece a otro usuario | UUID de cita de otro paciente/nutricionista | `403` — `"No tienes permiso para ver esta cita"` |

---

### 6.4 Confirmar cita

**Endpoint:** `PATCH /api/v1/appointments/:id/confirm`  
**Auth Requerida:** Sí — `Bearer <token>` (paciente **o** nutricionista de la cita)

> **Transición única válida:** `pending → confirmed`. No se puede confirmar una cita ya `cancelled`.

#### Casos a Probar

| # | Tipo | Descripción | Condición | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Confirmar cita `pending` (nutricionista) | `TOKEN_NUTRITIONIST`, cita en `pending` | `200` — `"Cita confirmada exitosamente"`, `status: "confirmed"` |
| 2 | ✅ **Caso Feliz** | Confirmar cita `pending` (paciente) | `TOKEN_PATIENT`, cita en `pending` | `200` — igual |
| 3 | ❌ **Negativo** | Cita ya está `confirmed` | Re-confirmar cita ya confirmada | `400` — `"La cita ya está en estado confirmed"` |
| 4 | ❌ **Negativo** | Cita ya está `cancelled` | Intentar confirmar cita cancelada | `400` — `"No se puede cambiar el estado de una cita cancelada"` |
| 5 | ❌ **Negativo** | ID inexistente | UUID no registrado | `404` — `"La cita especificada no existe"` |
| 6 | ❌ **Negativo** | Acceso no autorizado | Token de usuario no relacionado con la cita | `403` — `"No tienes permiso para actualizar esta cita"` |

---

### 6.5 Cancelar cita (`PATCH /cancel` o `DELETE`)

**Endpoint A:** `PATCH /api/v1/appointments/:id/cancel`  
**Endpoint B:** `DELETE /api/v1/appointments/:id`  
**Auth Requerida:** Sí — `Bearer <token>` (paciente **o** nutricionista de la cita)

> **Ambas rutas** llaman a `appointmentService.cancelAppointment` — comportamiento idéntico.  
> `cancelled` es un **estado terminal**: no se puede revertir.

#### Casos a Probar

| # | Tipo | Descripción | Condición | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Cancelar cita `pending` (paciente) | `TOKEN_PATIENT`, cita en `pending` | `200` — `"Cita cancelada exitosamente"`, `status: "cancelled"` |
| 2 | ✅ **Caso Feliz** | Cancelar cita `pending` (nutricionista) | `TOKEN_NUTRITIONIST` | `200` — igual |
| 3 | ✅ **Caso Feliz** | Cancelar vía `DELETE` | `DELETE /appointments/:id` | `200` — mismo resultado que PATCH /cancel |
| 4 | ❌ **Negativo** | Cita ya `confirmed` | Cancelar cita en estado `confirmed` | `400` — **verificar:** ¿la lógica permite cancelar desde `confirmed`? El service solo bloquea si ya está en `cancelled` — *leer resultado real* |
| 5 | ❌ **Negativo — Estado Terminal** | Cita ya `cancelled` | Intentar cancelar una cita ya cancelada | `400` — `"No se puede cambiar el estado de una cita cancelada"` |
| 6 | ❌ **Negativo** | ID inexistente | UUID no registrado | `404` — `"La cita especificada no existe"` |
| 7 | ❌ **Negativo** | Acceso no autorizado | Token ajeno a la cita | `403` — `"No tienes permiso para actualizar esta cita"` |

---

### 6.6 Modificar cita (solo en estado `pending`)

**Endpoint:** `PATCH /api/v1/appointments/:id`  
**Auth Requerida:** Sí — `Bearer <token>` (paciente **o** nutricionista de la cita)

> **Regla de negocio crítica:** Solo se pueden modificar citas en estado **`pending`**. Al menos un campo editable debe ser enviado.

#### Body de Prueba — Cambio de fecha y hora

```json
{
  "appointment_date": "2026-04-20",
  "start_time": "14:00",
  "end_time": "15:00"
}
```

#### Body de Prueba — Solo notas

```json
{
  "notes": "Actualización: también traigo análisis de sangre."
}
```

#### Body de Prueba — Actualización completa

```json
{
  "appointment_date": "2026-04-22",
  "start_time": "09:00",
  "end_time": "10:00",
  "notes": "Cambié la fecha por motivos de agenda."
}
```

#### Casos a Probar

| # | Tipo | Descripción | Condición | Respuesta Esperada |
|---|---|---|---|---|
| 1 | ✅ **Caso Feliz** | Modificar fecha de cita `pending` | `appointment_date` nueva y futura | `200` — `"Cita actualizada exitosamente"` con nueva fecha |
| 2 | ✅ **Caso Feliz** | Modificar solo las notas | Solo `notes` en body | `200` — `notes` actualizado |
| 3 | ✅ **Caso Feliz** | Modificar todos los campos a la vez | Body con `appointment_date`, `start_time`, `end_time`, `notes` | `200` — todos los campos actualizados |
| 4 | ✅ **Sin double-booking propio** | Mover franja a la misma hora | Actualizar sin cambiar horario real | `200` — no colisiona consigo mismo (usa `[Op.ne]: excludeId`) |
| 5 | ❌ **Negativo — Estado** | Modificar cita `confirmed` | Cita en estado `confirmed` | `400` — `"Solo se pueden modificar citas en estado "pending". Estado actual: "confirmed""` |
| 6 | ❌ **Negativo — Estado** | Modificar cita `cancelled` | Cita en estado `cancelled` | `400` — mismo mensaje con estado `cancelled` |
| 7 | ❌ **Negativo** | Body vacío | `{}` | `400` — `"Debes enviar al menos un campo editable: appointment_date, start_time, end_time o notes"` |
| 8 | ❌ **Negativo** | `appointment_date` en el pasado | `"appointment_date": "2020-01-01"` | `400` — `"La fecha y hora de la cita deben ser en el futuro"` |
| 9 | ❌ **Negativo** | `start_time >= end_time` | `"start_time": "15:00"`, `"end_time": "14:00"` | `400` — `"start_time debe ser menor que end_time"` |
| 10 | ❌ **409 — Double Booking** | Nueva fecha/hora colisiona con otra cita activa del mismo nutricionista | Mover la cita a un horario ya ocupado por otra | `409` — `"El nutricionista ya tiene un turno en ese rango horario"` |
| 11 | ❌ **Negativo** | Formato de UUID inválido en `:id` | `PATCH /appointments/no-es-uuid` | `400` — `"Formato de UUID inválido"` (PG code `22P02`) |
| 12 | ❌ **Negativo** | ID de cita no existente | UUID válido pero sin cita | `404` — `"La cita especificada no existe"` |
| 13 | ❌ **Negativo** | Acceso no autorizado | Token ajeno a la cita | `403` — `"No tienes permiso para modificar esta cita"` |

---

## 7. Orden de Ejecución Recomendado

Sigue este flujo para garantizar que los datos de prueba estén disponibles en cada paso.

```
┌─────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN INICIAL                                  │
├─────────────────────────────────────────────────────────┤
│  1. POST /auth/register  → crear usuario PATIENT        │
│  2. POST /auth/register  → crear usuario NUTRITIONIST   │
│  3. POST /auth/login     → obtener TOKEN_PATIENT        │
│  4. POST /auth/login     → obtener TOKEN_NUTRITIONIST   │
├─────────────────────────────────────────────────────────┤
│  PERFILES                                               │
├─────────────────────────────────────────────────────────┤
│  5. PUT  /patients/profile       → crear perfil paciente│
│  6. GET  /patients/profile       → verificar            │
│  7. PUT  /nutritionists/profile  → crear perfil nutri.  │
│  8. GET  /nutritionists/profile  → verificar            │
│  9. GET  /nutritionists          → listar (público)     │
├─────────────────────────────────────────────────────────┤
│  DISPONIBILIDAD                                         │
├─────────────────────────────────────────────────────────┤
│ 10. POST /nutritionists/availability → establecer       │
│ 11. PUT  /nutritionists/availability → reemplazar       │
│ 12. GET  /nutritionists/profile      → verificar slots  │
├─────────────────────────────────────────────────────────┤
│  CITAS (flujo completo)                                 │
├─────────────────────────────────────────────────────────┤
│ 13. POST /appointments          → crear (→ APPOINTMENT_ID)│
│ 14. GET  /appointments/my-calendar → ver calendario     │
│ 15. GET  /appointments/:id      → ver detalle           │
│ 16. PATCH /appointments/:id     → modificar (en pending)│
│ 17. PATCH /appointments/:id/confirm → confirmar         │
│ 18. PATCH /appointments/:id/cancel  → cancelar          │
│     (verificar que no se pueda cambiar desde cancelled) │
└─────────────────────────────────────────────────────────┘
```

---

### Checklist de Pruebas de Regresión Post-Cambios

Antes de cada merge a `develop`, ejecutar como mínimo:

- [ ] `POST /auth/register` — flujo completo
- [ ] `POST /auth/login` — flujo completo
- [ ] `PUT /nutritionists/availability` — reemplazo limpio
- [ ] `POST /appointments` — caso feliz + double-booking (caso 18)
- [ ] `PATCH /appointments/:id/confirm` + intento de re-confirmar (caso 3)
- [ ] `PATCH /appointments/:id/cancel` + intento de editar después (casos 5-6 de §6.6)
- [ ] `PATCH /appointments/:id` — edición en `pending` con nueva hora que colisiona (caso 10)
