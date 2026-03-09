# Refactorización de Autenticación - Documentación

## Resumen de Cambios

Se ha completado la refactorización de la autenticación para usar la base de datos real (Sequelize con PostgreSQL) y JWT reales, manteniendo una arquitectura de capas limpia.

## Cambios Realizados

### 1. Instalación de Dependencias
- ✅ Instalado: `jsonwebtoken` (versión ^9.0.3)

### 2. Refactorización de `src/services/userService.js`

**Cambios principales:**
- Importación de `jsonwebtoken` para generar JWT reales
- Importación del modelo `User` de Sequelize
- Eliminación del almacenamiento en memoria (lista interna)
- Implementación de métodos usando consultas a la base de datos:

#### Método `createUser(userData)`
```javascript
async createUser(userData) {
  // Verifica si el email ya existe
  // Lanza error 400 si existe
  // Crea usuario en la BD con:
  // - email
  // - password_hash (hasheado automáticamente por hook beforeCreate)
  // - name
  // - role (default: 'patient')
  // Retorna usuario sin contraseña
}
```

#### Método `loginUser(email, password)`
```javascript
async loginUser(email, password) {
  // Busca usuario por email
  // Valida contraseña usando bcrypt.compare()
  // Si es válida, genera JWT con:
  // - payload: { id, email, role }
  // - expiresIn: '7d'
  // - secret: process.env.JWT_SECRET
  // Retorna { user, token }
}
```

### 3. Refactorización de `src/controllers/authController.js`

**Cambios principales:**
- Formato estándar de respuestas JSON:
  ```json
  {
    "success": boolean,
    "message": string,
    "data": {} (opcional)
  }
  ```
- Manejo robusto de errores con try/catch
- Códigos HTTP apropiados:
  - 201: Registro exitoso
  - 200: Login exitoso
  - 400: Error de validación (email duplicado, campos faltantes)
  - 401: Credenciales inválidas
  - 500: Error de servidor

#### Endpoint: POST `/auth/register`
```javascript
// Request
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePassword123!",
  "role": "patient" // opcional, default: 'patient'
}

// Response (201)
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "patient",
      "is_active": true,
      "createdAt": "2025-02-17T...",
      "updatedAt": "2025-02-17T..."
    }
  }
}

// Response (400) - Email duplicado
{
  "success": false,
  "message": "El email ya está registrado"
}

// Response (400) - Campos faltantes
{
  "success": false,
  "message": "Los campos nombre, email y contraseña son requeridos"
}
```

#### Endpoint: POST `/auth/login`
```javascript
// Request
{
  "email": "juan@example.com",
  "password": "SecurePassword123!"
}

// Response (200)
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "patient",
      "is_active": true,
      "createdAt": "2025-02-17T...",
      "updatedAt": "2025-02-17T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Response (401) - Credenciales inválidas
{
  "success": false,
  "message": "Email o contraseña inválidos"
}

// Response (400) - Campos faltantes
{
  "success": false,
  "message": "Email y contraseña son requeridos"
}
```

### 4. Modelo User.js

**Cambios agregados:**
- Campo `name` (STRING, required): Nombre completo del usuario

**Campos existentes:**
- `id` (UUID, PK): Identificador único
- `email` (STRING, unique): Email único del usuario
- `password_hash` (STRING): Contraseña hasheada con bcrypt
- `role` (ENUM): 'patient', 'nutritionist', o 'admin'
- `is_active` (BOOLEAN): Estado del usuario
- `createdAt`, `updatedAt`: Timestamps automáticos

**Métodos:**
- `validatePassword(password)`: Compara contraseña con hash bcrypt
- `toJSON()`: Retorna usuario sin password_hash

### 5. Variables de Entorno

**Archivo `.env` y `.env.example` actualizado:**
```env
# Database Configuration
DB_HOST=localhost (or nutrium-db en Docker)
DB_USER=postgres (or nutrium_user en Docker)
DB_PASS=password (or nutrium_password en Docker)
DB_NAME=nutriom_db (or nutrium_db en Docker)
DB_PORT=5432

# JWT Configuration - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Seguridad

✅ **Implementado:**
- Contraseñas hasheadas con bcrypt (10 rondas de salt)
- JWT con expiración (7 días)
- Email único (constraint en BD)
- Validación de credenciales segura
- Las respuestas nunca incluyen la contraseña

⚠️ **IMPORTANTE en Producción:**
- Cambiar `JWT_SECRET` a una cadena aleatoria fuerte
- Usar HTTPS
- Agregar rate limiting para login/register
- Considerar agregar CORS más restrictivo
- Validar y sanitizar entrada del usuario

## Arquitectura de Capas

```
Request
  ↓
Controller (authController.js)
  ├─ Valida entrada
  ├─ Llama Service
  └─ Formatea respuesta
  ↓
Service (userService.js)
  ├─ Lógica de negocio
  ├─ Genera JWT
  └─ Retorna datos
  ↓
Model (User.js)
  ├─ Interact con BD
  ├─ Hooks (beforeCreate para hash)
  └─ Validaciones
  ↓
Database (PostgreSQL)
```

## Testing Manual con cURL

### Registro
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "SecurePass123!",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123!"
  }'
```

### Usar Token JWT
```bash
curl -X GET http://localhost:3000/api/v1/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Próximos Pasos (Recomendado)

1. **Middleware de autenticación**: Crear middleware para validar JWT en rutas protegidas
2. **Refresh tokens**: Implementar tokens de refresco para mayor seguridad
3. **Rate limiting**: Prevenir fuerza bruta en login/register
4. **Email verification**: Verificar email antes de activar cuenta
5. **Password reset**: Implementar flujo de recuperación de contraseña
6. **Audit logging**: Registrar intentos de login fallidos

