# Arquitectura de Bases de Datos (Microservicios)
**Fecha:** 23/02/2026

Para cumplir con las directrices de arquitectura del PRD que establecen que el servicio de IA es desacoplado y tiene su propia base de datos, hemos implementado un patrón de **Base de Datos por Microservicio** en nuestro `docker-compose.yml`.



## 1. Base de Datos Operativa (Node.js / Fullstack)
- **Servicio Docker:** `db-node`
- **Puerto expuesto (Host):** `5432`
- **Credenciales:** `nutrium_node_user` / `nutrium_node_password`
- **Esquema:** `Nutriom.sql`
- **Propósito:** Es la fuente de la verdad transaccional. Utiliza un esquema estrictamente relacional (`clinical_tags`, `availabilities`, `patient_profiles`) para optimizar consultas de backend, garantizar integridad referencial y permitir filtros complejos a alta velocidad.

## 2. Base de Datos Analítica/IA (Python / FastAPI)
- **Servicio Docker:** `db-ai`
- **Puerto expuesto (Host):** `5433` (Atención: usar este puerto en el `.env` del servicio Python local).
- **Credenciales:** `nutrium_ai_user` / `nutrium_ai_password`
- **Esquema:** `init-db/01-schema.sql`
- **Propósito:** Base de datos documental para el servicio de Inteligencia Artificial. Almacena el historial de interacciones (`ai_interactions`) y los logs del modelo. 

## 📝 Contrato de Comunicación (API)
Los servicios no comparten bases de datos directamente. Cuando el paciente solicite un emparejamiento, el backend de Node.js recopilará la información estructurada de su base de datos relacional y realizará una llamada HTTP `POST` a la API de Python, enviando el payload en formato JSON.