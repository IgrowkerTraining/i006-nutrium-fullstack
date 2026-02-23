# Documentación API - Módulo de Pacientes

## Base Path
```
/api/v1/patients
```

## Autenticación
Todos los endpoints del módulo de pacientes requieren autenticación.

**Headers requeridos:**
```
Authorization: Bearer <userId>
```

---

## 1. Obtener Perfil del Paciente

### Información General
- **Método:** `GET`
- **URL:** `/api/v1/patients/profile`
- **Autenticación requerida:** Sí

### Headers
```
Authorization: Bearer <userId>
Content-Type: application/json
```

### Request
```json
// Sin body requerido
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombreCompleto": "Juan Pérez García",
    "fechaNacimiento": "1990-03-15T00:00:00.000Z",
    "pais": "España",
    "ciudad": "Madrid",
    "modalidad": "Virtual",
    "disponibilidad": "Mañana",
    "objetivo": "Pérdida de peso",
    "createdAt": "2025-02-22T10:30:00.000Z",
    "updatedAt": "2025-02-22T10:30:00.000Z"
  }
}
```

### Response (200 OK - Sin perfil registrado)
```json
{
  "success": true,
  "message": "No hay perfil registrado",
  "data": null
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

### Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error al obtener perfil",
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP
- **200:** Éxito (perfil existe o no existe)
- **401:** No autenticado / Token inválido
- **500:** Error de servidor

---

## 2. Crear o Actualizar Perfil del Paciente

### Información General
- **Método:** `POST`
- **URL:** `/api/v1/patients/profile`
- **Autenticación requerida:** Sí

### Headers
```
Authorization: Bearer <userId>
Content-Type: application/json
```

### Request Body (Todos los campos requeridos)
```json
{
  "nombreCompleto": "Juan Pérez García",
  "fechaNacimiento": "1990-03-15",
  "pais": "España",
  "ciudad": "Madrid",
  "modalidad": "Virtual",
  "disponibilidad": "Mañana",
  "objetivo": "Pérdida de peso"
}
```

### Campos Requeridos
| Campo | Tipo | Ejemplo | Requisito |
|-------|------|---------|-----------|
| `nombreCompleto` | String | "Juan Pérez García" | Requerido |
| `fechaNacimiento` | Date (YYYY-MM-DD) | "1990-03-15" | Requerido |
| `pais` | String | "España" | Requerido |
| `ciudad` | String | "Madrid" | Requerido |
| `modalidad` | Enum | "Virtual" | Requerido |
| `disponibilidad` | Enum | "Mañana" | Requerido |
| `objetivo` | Enum | "Pérdida de peso" | Requerido |

### Valores Permitidos (Enumeradores)

#### Modalidad
```
- Virtual
- Presencial
- Mixto
```

#### Disponibilidad
```
- Mañana
- Tarde
```

#### Objetivo
```
- Pérdida de peso
- Ganancia de masa muscular
- Reeducación alimentaria
- Mejorar salud digestiva
- Mejorar composición corporal
- Aumentar energía
- Mejorar rendimiento deportivo
- Organización de hábitos alimentarios
- Alimentación para condición digestiva específica
- Prevención y bienestar general
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "nombreCompleto": "Juan Pérez García",
    "fechaNacimiento": "1990-03-15T00:00:00.000Z",
    "pais": "España",
    "ciudad": "Madrid",
    "modalidad": "Virtual",
    "disponibilidad": "Mañana",
    "objetivo": "Pérdida de peso",
    "createdAt": "2025-02-22T10:30:00.000Z",
    "updatedAt": "2025-02-22T10:35:20.000Z"
  }
}
```

### Response (400 Bad Request - Validación)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "nombreCompleto",
      "message": "nombreCompleto es requerido"
    },
    {
      "field": "modalidad",
      "message": "modalidad es requerida"
    },
    {
      "field": "objetivo",
      "message": "objetivo es requerido"
    }
  ]
}
```

### Response (400 Bad Request - Enumerador inválido)
```json
{
  "success": false,
  "message": "Modalidad inválida. Permitidas: Virtual, Presencial, Mixto"
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

### Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error al actualizar perfil",
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP
- **201:** Perfil creado o actualizado exitosamente
- **400:** Validación fallida (campos faltantes o enumeradores inválidos)
- **401:** No autenticado / Token inválido
- **500:** Error de servidor

---

## 3. Obtener Tags/Condiciones de Salud del Paciente

### Información General
- **Método:** `GET`
- **URL:** `/api/v1/patients/tags`
- **Autenticación requerida:** Sí

### Headers
```
Authorization: Bearer <userId>
Content-Type: application/json
```

### Request
```json
// Sin body requerido
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Tags obtenidos exitosamente",
  "data": {
    "condiciones": [
      "SIBO",
      "Disbiosis intestinal",
      "Intolerancia a la lactosa"
    ],
    "otraCondicion": "Sensibilidad a ciertos químicos alimentarios"
  }
}
```

### Response (200 OK - Sin tags registrados)
```json
{
  "success": true,
  "message": "Tags obtenidos exitosamente",
  "data": {
    "condiciones": [],
    "otraCondicion": null
  }
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

### Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error al obtener tags",
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP
- **200:** Éxito
- **401:** No autenticado / Token inválido
- **500:** Error de servidor

---

## 4. Crear o Actualizar Tags/Condiciones de Salud

### Información General
- **Método:** `POST`
- **URL:** `/api/v1/patients/tags`
- **Autenticación requerida:** Sí

### Headers
```
Authorization: Bearer <userId>
Content-Type: application/json
```

### Request Body (Opcional - Para crear registro vacío omitir body)
```json
{
  "condiciones": [
    "SIBO",
    "Disbiosis intestinal",
    "Intolerancia a la lactosa"
  ],
  "otraCondicion": "Sensibilidad a ciertos químicos alimentarios"
}
```

### Campos
| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| `condiciones` | Array de Strings | No | `["SIBO", "Disbiosis intestinal"]` |
| `otraCondicion` | String | No | "Sensibilidad a químicos" |

### Valores Permitidos - Condiciones (Enumeradores)
```
- SIBO
- Disbiosis intestinal
- Síndrome de intestino irritable (SII / IBS)
- Intolerancia a la lactosa
- Intolerancia al gluten
- Sobrecrecimiento bacteriano colónico
- Sobrecrecimiento de levaduras (Candida)
- Parasitosis intestinal
- Inflamación intestinal de bajo grado
- Permeabilidad intestinal aumentada
- Alteraciones post-antibióticos
- Estreñimiento crónico funcional
- Diarrea funcional crónica
- Crecimiento bacteriano intestinal distal
- Desequilibrio de la microbiota intestinal
- Fermentación intestinal excesiva
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Tags actualizados exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "condiciones": [
      "SIBO",
      "Disbiosis intestinal",
      "Intolerancia a la lactosa"
    ],
    "otraCondicion": "Sensibilidad a ciertos químicos alimentarios",
    "createdAt": "2025-02-22T10:30:00.000Z",
    "updatedAt": "2025-02-22T10:45:30.000Z"
  }
}
```

### Response (400 Bad Request - Tipo inválido)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "condiciones",
      "message": "condiciones debe ser un array de strings"
    }
  ]
}
```

### Response (400 Bad Request - Enumerador inválido)
```json
{
  "success": false,
  "message": "Condiciones inválidas: Tuberculosis, COVID-19. Permitidas: SIBO, Disbiosis intestinal, ..."
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

### Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error al actualizar tags",
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP
- **201:** Tags creados o actualizados exitosamente
- **400:** Validación fallida (tipos inválidos o enumeradores no permitidos)
- **401:** No autenticado / Token inválido
- **500:** Error de servidor

---

## Ejemplos de Uso Completos

### Ejemplo 1: Crear Perfil Completo

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/patients/profile \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCompleto": "María García López",
    "fechaNacimiento": "1985-07-20",
    "pais": "España",
    "ciudad": "Barcelona",
    "modalidad": "Mixto",
    "disponibilidad": "Tarde",
    "objetivo": "Mejorar salud digestiva"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "nombreCompleto": "María García López",
    "fechaNacimiento": "1985-07-20T00:00:00.000Z",
    "pais": "España",
    "ciudad": "Barcelona",
    "modalidad": "Mixto",
    "disponibilidad": "Tarde",
    "objetivo": "Mejorar salud digestiva",
    "createdAt": "2025-02-22T11:00:00.000Z",
    "updatedAt": "2025-02-22T11:00:00.000Z"
  }
}
```

### Ejemplo 2: Agregar Tags de Salud

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/patients/tags \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -d '{
    "condiciones": [
      "Síndrome de intestino irritable (SII / IBS)",
      "Intolerancia al gluten",
      "Disbiosis intestinal"
    ],
    "otraCondicion": "Sensibilidad a aditivos alimentarios"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Tags actualizados exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "condiciones": [
      "Síndrome de intestino irritable (SII / IBS)",
      "Intolerancia al gluten",
      "Disbiosis intestinal"
    ],
    "otraCondicion": "Sensibilidad a aditivos alimentarios",
    "createdAt": "2025-02-22T11:00:00.000Z",
    "updatedAt": "2025-02-22T11:05:00.000Z"
  }
}
```

### Ejemplo 3: Obtener Perfil

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/patients/profile \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombreCompleto": "María García López",
    "fechaNacimiento": "1985-07-20T00:00:00.000Z",
    "pais": "España",
    "ciudad": "Barcelona",
    "modalidad": "Mixto",
    "disponibilidad": "Tarde",
    "objetivo": "Mejorar salud digestiva",
    "createdAt": "2025-02-22T11:00:00.000Z",
    "updatedAt": "2025-02-22T11:00:00.000Z"
  }
}
```

### Ejemplo 4: Obtener Tags

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/patients/tags \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Tags obtenidos exitosamente",
  "data": {
    "condiciones": [
      "Síndrome de intestino irritable (SII / IBS)",
      "Intolerancia al gluten",
      "Disbiosis intestinal"
    ],
    "otraCondicion": "Sensibilidad a aditivos alimentarios"
  }
}
```

---

## Notas Importantes

### Autenticación
- **Tokens:** En producción, se usarán JWT reales. Por ahora, para testing, usar el `userId` como token.
- **Formato:** `Authorization: Bearer <userId>`

### Validaciones
- Todos los campos de perfil son **requeridos** en POST
- Tags son **opcionales**, se puede POST un objeto vacío o sin body
- Enumeradores son **case-sensitive** (exactamente como están listados)
- Fechas deben estar en formato **ISO (YYYY-MM-DD)**

### Timestamps
- `createdAt`: Nunca cambia, se establece en la creación
- `updatedAt`: Se actualiza cada vez que se modifica el registro

### Códigos de Estado
- **2xx:** Éxito (200 para GET, 201 para POST)
- **4xx:** Error del cliente (validación, autenticación)
- **5xx:** Error del servidor

### Estructura de Respuesta
Todas las respuestas siguen el mismo formato:
```json
{
  "success": boolean,
  "message": string,
  "data": object|null,
  "error": string (solo en caso de error),
  "errors": array (solo en validación)
}
```

---

## Próximos Pasos (TODO)

1. **JWT Real:** Reemplazar autenticación de prueba con JWT real
2. **Relación User-Patient:** Asegurar relación 1:1 correcta en BD
3. **Migraciones:** Crear migraciones de Sequelize para tabla `patients`
4. **Unit Tests:** Agregar pruebas unitarias para controladores y servicios
5. **Rate Limiting:** Agregar rate limiting a endpoints sensibles
6. **Logging:** Agregar sistema de logging para auditoría
7. **Soft Delete:** Considerar soft delete para pacientes en lugar de delete real

