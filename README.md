# 🚀 Template Fullstack: React + Node.js

¡Bienvenido! Este es un proyecto template fullstack diseñado para desarrolladores junior que quieren aprender cómo construir aplicaciones web modernas con React y Node.js.

## 📋 Descripción del Proyecto

Esta es una aplicación de autenticación completa con:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + JavaScript
- **Autenticación**: Sistema de login y registro
- **UI/UX**: Diseño moderno y responsivo

## 🗂️ Estructura del Proyecto

```
template-react-node-fullstack/
├── apps/
│   ├── backend/          # Servidor Node.js
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   ├── server.js     # Punto de entrada
│   │   └── package.json
│   └── frontend/         # Aplicación React
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── context/
│       │   └── services/
│       ├── index.html
│       └── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Frontend

- **React 19**: Biblioteca principal de UI
- **TypeScript**: Tipado estático
- **Vite**: Herramienta de build y desarrollo
- **React Router**: Manejo de rutas
- **Tailwind CSS**: Framework de CSS
- **pnpm**: Gestor de paquetes

### Backend

- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **CORS**: Middleware para cross-origin
- **body-parser**: Middleware para parsear JSON

## � Docker (Opcional)

### Usar Docker Compose para Desarrollo

```bash
# Iniciar ambos servicios con Docker
docker-compose up --build

# Detener los servicios
docker-compose down

# Reconstruir y empezar
docker-compose up --build --force-recreate
```

### Construir Imágenes Individuales

```bash
# Backend
cd apps/backend
docker build -t example-auth-backend .

# Frontend
cd apps/frontend
docker build -t example-auth-frontend .
```

### Docker para Producción

```bash
# Usar el stage de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## �🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- pnpm (recomendado) o npm
- Docker y Docker Compose (opcional)

### 1. Instalar Dependencias

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd apps/frontend
pnpm install
```

### 2. Ejecutar las Aplicaciones

```bash
# Backend (en una terminal)
cd apps/backend
npm run dev
# → Corre en http://localhost:3000

# Frontend (en otra terminal)
cd apps/frontend
pnpm run dev
# → Corre en http://localhost:5173
```

## 📚 Guía para Desarrolladores Junior

### ¿Cómo funciona la aplicación?

1. **Registro**: Los usuarios crean una cuenta con email y contraseña
2. **Login**: Los usuarios inician sesión y reciben un token mock
3. **Dashboard**: Vista protegida que muestra información del usuario

### Flujo de Autenticación

```
Usuario → Frontend → Backend → Base de datos (mock) → Backend → Frontend → Usuario
```

### Componentes Principales del Frontend

- **AuthProvider**: Contexto de React para manejar el estado de autenticación
- **Login/Register**: Formularios de autenticación
- **Dashboard**: Página protegida
- **Routes**: Configuración de rutas públicas y privadas

### Endpoints del Backend

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/health` - Verificar estado del servidor

## ⚠️ **IMPORTANTE: Esto es solo una base**

Este proyecto es un **template educativo**. Para producción necesitas implementar:

### 🔐 Seguridad Real

- [ ] **Base de datos real** (PostgreSQL, MongoDB, etc.)
- [ ] **JWT tokens** válidos con expiración
- [ ] **Hashing de contraseñas** (bcrypt)
- [ ] **Variables de entorno** para secrets
- [ ] **Validación de inputs** más robusta
- [ ] **Rate limiting** para prevenir ataques

### 🗄️ Base de Datos

```javascript
// Ejemplo de lo que necesitarías implementar:
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// Servicio de usuario real
class UserService {
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    // Guardar en base de datos real
  }

  async authenticate(email, password) {
    const user = await this.findByEmail(email);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");
    return user;
  }
}
```

### 🚀 Características Faltantes

- [ ] **Recuperación de contraseña**
- [ ] **Verificación de email**
- [ ] **Perfil de usuario editable**
- [ ] **Logout real** (invalidar tokens)
- [ ] **Roles y permisos**
- [ ] **Logs y auditoría**
- [ ] **Tests unitarios y de integración**
- [ ] **Dockerización**
- [ ] **CI/CD pipeline**

### 📊 Mejoras de Performance

- [ ] **Caching** (Redis)
- [ ] **CDN** para assets estáticos
- [ ] **Lazy loading** de componentes
- [ ] **Optimización de bundle**
- [ ] **Service Worker** para PWA

## 🐛 Problemas Comunes y Soluciones

### "Port already in use"

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### "pnpm command not found"

```bash
# Instalar pnpm
npm install -g pnpm
```

### Error de CORS

Asegúrate que el backend tenga el middleware CORS configurado.

## 🎯 Próximos Pasos Recomendados

1. **Aprender sobre bases de datos SQL/NoSQL**
2. **Estudiar JWT y autenticación moderna**
3. **Implementar validación con Joi/Zod**
4. **Agregar tests con Jest/Vitest**
5. **Configurar Docker**
6. **Desplegar en producción (Vercel, Railway, etc.)**

## 📖 Recursos de Aprendizaje

- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contribuciones

¡Este es un proyecto educativo! Si encuentras errores o tienes sugerencias, siéntete libre de abrir un issue o hacer un pull request.

## 📄 Licencia

MIT License - puedes usar este proyecto para aprender y construir tus propias aplicaciones.

---

**Recuerda**: Este es solo el comienzo. La programación web es un campo vasto y emocionante. ¡Sigue aprendiendo y construyendo! 🚀
