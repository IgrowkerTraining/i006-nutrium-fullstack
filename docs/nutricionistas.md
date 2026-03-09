# Guía de pruebas – Nutricionistas y Citas (Thunder Client)

Documento de referencia para probar los endpoints del módulo de nutricionistas usando **Thunder Client** (extensión de VS Code) o cualquier cliente REST (Insomnia, Postman, etc.).

---

## Configuración inicial

| Variable       | Valor                              |
|----------------|------------------------------------|
| `baseUrl`      | `http://localhost:3000/api/v1`     |
| `token`        | JWT obtenido en el paso de login   |

> **Puerto por defecto:** `3000`. Si usás Docker con el `docker-compose.yml` del proyecto, el backend está expuesto en ese puerto.

---

## Flujo recomendado de pruebas

```
1. Registrar usuario con role "nutritionist"
2. Hacer login → copiar el token
3. Consultar perfil (debe devolver 404 si es nuevo)
4. Crear/actualizar perfil del nutricionista
5. Establecer franjas de disponibilidad
6. Listar nutricionistas (endpoint público)
```

---

## 1. Autenticación

### 1.1 Registrar usuario nutricionista

```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Ana García",
  "email": "ana.garcia@nutriom.com",
  "password": "Contraseña123!",
  "role": "nutritionist"
}
```

**Respuesta exitosa `201`:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "name": "Ana García",
      "email": "ana.garcia@nutriom.com",
      "role": "nutritionist"
    }
  }
}
```

---

### 1.2 Login

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "ana.garcia@nutriom.com",
  "password": "Contraseña123!"
}
```

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "name": "Ana García",
      "role": "nutritionist"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}
```

> **Importante:** Copiá el valor de `token` y usalo en el header `Authorization: Bearer <token>` en todos los endpoints protegidos.

---

## 2. Endpoints de Nutricionistas

Base: `/api/v1/nutritionists`

---

### 2.1 Obtener perfil propio

```
GET http://localhost:3000/api/v1/nutritionists/profile
Authorization: Bearer <token>
```

**Sin body.** Requiere token con role `nutritionist`.

**Respuesta `200` (perfil existente):**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "profile": {
      "id": 1,
      "license_number": "MP-12345",
      "bio": "Especialista en nutrición deportiva",
      "modality": "online",
      "years_of_experience": 5,
      "tags": [
        { "id": 1, "name": "Diabetes", "category": "endocrinología" }
      ],
      "availability": [
        { "day_of_week": 1, "start_time": "09:00", "end_time": "13:00" }
      ]
    }
  }
}
```

**Respuesta `404` (perfil aún no creado):**
```json
{
  "success": false,
  "message": "Perfil no encontrado"
}
```

---

### 2.2 Crear o actualizar perfil (Upsert)

```
PUT http://localhost:3000/api/v1/nutritionists/profile
Authorization: Bearer <token>
Content-Type: application/json
```

- **Headers:** `Authorization: Bearer <token_jwt>`
- **Body:**
  ```json
  {
    "license_number": "MN-102030", // Requerido
    "bio": "Especialista en recomposición corporal.", // Requerido
    "modality": "online", // Opciones válidas: "online", "presencial", "hibrida"
    "years_of_experience": 5, // Número entero >= 0
    "tag_ids": [1, 2, 8] // Array de IDs enteros referenciando a `clinical_tags`
  }
```

| Campo                | Tipo    | Requerido | Descripción                                              |
|----------------------|---------|-----------|----------------------------------------------------------|
| `license_number`     | string  | ✅        | Matrícula profesional única (ej: `"MP-12345"`)           |
| `bio`                | string  | ✅        | Descripción o presentación profesional                   |
| `modality`           | string  | ✅        | `"online"` \| `"presencial"` \| `"hibrida"`             |
| `years_of_experience`| integer | ✅        | Años de experiencia (≥ 0)                                |
| `tag_ids`            | array   | ✅        | IDs enteros de los tags clínicos (`clinical_tags`)       |

**Respuesta `201` (perfil creado por primera vez):**
```json
{
  "success": true,
  "message": "Perfil creado exitosamente",
  "data": { "profile": { ... } }
}
```

**Respuesta `200` (perfil actualizado):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": { "profile": { ... } }
}
```

---

### 2.3 Establecer disponibilidad (agenda semanal)

```
POST http://localhost:3000/api/v1/nutritionists/availability
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "slots": [
    { "day_of_week": 1, "start_time": "09:00", "end_time": "13:00" },
    { "day_of_week": 3, "start_time": "15:00", "end_time": "19:00" },
    { "day_of_week": 5, "start_time": "08:00", "end_time": "12:00" }
  ]
}
```

**Convención `day_of_week`:**

| Número | Día         |
|--------|-------------|
| 0      | Domingo     |
| 1      | Lunes       |
| 2      | Martes      |
| 3      | Miércoles   |
| 4      | Jueves      |
| 5      | Viernes     |
| 6      | Sábado      |

> ⚠️ Este endpoint **reemplaza completamente** las franjas activas. Si mandás un array vacío `"slots": []`, se eliminan todas las franjas.

**Respuesta `200`:**
```json
{
  "success": true,
  "message": "Disponibilidad actualizada: 3 franja(s) guardada(s)",
  "data": {
    "slots": [
      { "id": 1, "day_of_week": 1, "start_time": "09:00", "end_time": "13:00" },
      { "id": 2, "day_of_week": 3, "start_time": "15:00", "end_time": "19:00" },
      { "id": 3, "day_of_week": 5, "start_time": "08:00", "end_time": "12:00" }
    ]
  }
}
```

---

### 2.4 Listar nutricionistas (público, sin token)

```
GET http://localhost:3000/api/v1/nutritionists
```

**Query params opcionales:**

| Param   | Descripción                                      | Ejemplo            |
|---------|--------------------------------------------------|--------------------|
| `page`  | Número de página (default: `1`)                  | `?page=2`          |
| `limit` | Resultados por página (default: `10`)            | `?limit=5`         |
| `tag`   | Filtrar por slug de especialidad clínica         | `?tag=deportiva`   |

**Ejemplos:**
```
GET http://localhost:3000/api/v1/nutritionists?page=1&limit=10
GET http://localhost:3000/api/v1/nutritionists?tag=deportiva
```

**Respuesta `200`:**
```json
{
  "success": true,
  "message": "Listado de nutricionistas obtenido",
  "data": {
    "nutritionists": [ { ... } ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

## 3. Tags Clínicos disponibles

Los `tag_ids` del body del perfil hacen referencia a la tabla `clinical_tags`. Algunos valores de ejemplo que podrían existir en la base de datos:

| ID | Nombre                  | Categoría         |
|----|-------------------------|-------------------|
| 1  | Diabetes                | endocrinología    |
| 2  | Nutrición deportiva     | deportiva         |
| 3  | Pérdida de peso         | general           |
| 4  | Nutrición infantil      | pediatría         |
| 5  | Vegetarianismo/Veganismo| general           |

> Para ver los tags reales disponibles, consultá directamente la base de datos:
> ```sql
> SELECT * FROM clinical_tags;
> ```

---

## 4. Errores comunes y cómo resolverlos

| Código | Mensaje                             | Causa                                              | Solución                                          |
|--------|-------------------------------------|----------------------------------------------------|---------------------------------------------------|
| `400`  | "Los campos ... son requeridos"     | Falta un campo obligatorio en el body              | Revisá que el JSON tenga todos los campos         |
| `401`  | "Token inválido o expirado"         | Token ausente, mal formado o vencido               | Volvé a hacer login y copiá el nuevo token        |
| `403`  | "No autorizado"                     | El usuario autenticado no tiene role `nutritionist`| Registrá el usuario con `"role": "nutritionist"` |
| `404`  | "Perfil no encontrado"              | Pediste el perfil antes de crearlo                 | Primero hacé el PUT /profile                      |
| `409`  | "Matrícula ya registrada"           | `license_number` ya existe en otro perfil          | Usá un número de matrícula diferente              |
| `500`  | "Error al ..."                      | Error interno del servidor                         | Revisá los logs del backend con `docker logs`     |

---

## 5. Colección Thunder Client – Configuración rápida

### Cómo configurar variables de entorno en Thunder Client:

1. Abrí Thunder Client en VS Code (`Ctrl+Shift+P` → "Thunder Client")
2. Ir a **Env** → **New Environment** → nombre: `Nutriom Local`
3. Agregar variables:
   - `baseUrl` = `http://localhost:3000/api/v1`
   - `token` = *(dejar vacío, se completa después del login)*
4. En cada request usar `{{baseUrl}}` y `{{token}}`

### Header de autenticación:

En todos los endpoints protegidos agregá el header:
```
Authorization: Bearer {{token}}
```

---

## 6. Secuencia completa de prueba paso a paso

```
1. POST {{baseUrl}}/auth/register      → Registrar como nutritionist
2. POST {{baseUrl}}/auth/login         → Copiar token de la respuesta
   → Actualizar variable {{token}} en Thunder Client
3. GET  {{baseUrl}}/nutritionists/profile          → Debe dar 404
4. PUT  {{baseUrl}}/nutritionists/profile          → Crear perfil con datos válidos
5. GET  {{baseUrl}}/nutritionists/profile          → Ahora debe devolver 200
6. POST {{baseUrl}}/nutritionists/availability     → Configurar agenda
7. GET  {{baseUrl}}/nutritionists                  → Verificar en el listado público
8. PUT  {{baseUrl}}/nutritionists/profile          → Modificar un campo y verificar que devuelve 200
9. POST {{baseUrl}}/nutritionists/availability     → Enviar slots vacíos → verificar que se eliminan
```

---

## 7. Health Check – Verificar que el servidor está activo

```
GET http://localhost:3000/api/v1/health
```

**Respuesta esperada `200`:**
```json
{
  "success": true,
  "message": "OK"
}
```

Si este endpoint falla, el servidor no está corriendo. Revisá con:
```bash
docker-compose up --build -d
docker logs <nombre-del-contenedor-backend>
```
