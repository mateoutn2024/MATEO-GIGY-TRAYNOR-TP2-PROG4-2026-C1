# SocialHub — Enterprise REST API & Analytics Platform 🌐🚀

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_RBAC-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Plataforma social orientada a entornos corporativos. Cuenta con una arquitectura modular desacoplada basada en una **API REST construida con NestJS** y un cliente web interactivo en **Angular**, incorporando métricas operativas y estrictos esquemas de autenticación y autorización por roles.

---

## 🎯 Desafíos Técnicos Resueltos

* **Seguridad de Sesiones y Rotación de Tokens:**  
  Implementación de autenticación JWT de doble factor con access tokens de corta duración (15 minutos) combinados con refresh tokens persistidos de forma segura para mitigar secuestro de sesión.
* **Control de Acceso Basado en Roles (RBAC):**  
  Decoradores y Guards personalizados en NestJS para segmentar accesos administrativos, moderación de contenido e interacciones estándar de usuarios.
* **Integridad Referencial con Bajas Lógicas (Soft Deletes):**  
  Estrategia de eliminación no destructiva mediante flags de auditoría (`deletedAt`), preservando la consistencia histórica en hilos de comentarios y analíticas de interacción.
* **Visualización de Métricas:**  
  Agregaciones en MongoDB para procesar índices de actividad, publicaciones con mayor tracción y volumen de usuarios sin impactar los tiempos de respuesta de la API.

---

## 🛠️ Stack Tecnológico

* **Backend:** Node.js, NestJS, TypeScript, Passport.js, JWT, Bcrypt.
* **Persistencia:** MongoDB con Mongoose (validación por esquemas y agregaciones).
* **Frontend:** Angular, RxJS, Tailwind CSS / SCSS.
* **Arquitectura:** Capas modulares (Controllers, Services, Repositories, DTOs con `class-validator`).

---

## 🏗️ Arquitectura del Sistema

```text
[ Cliente Angular ]
        │  ▲
        │  │ (HTTP / JSON / Bearer Tokens)
        ▼  │
[ NestJS Modular REST API ]
  ├── AuthModule (JWT, Passport, Guards RBAC)
  ├── UsersModule (Perfiles, Roles)
  ├── PostsModule (Feed, Comentarios, Soft Deletes)
  └── AnalyticsModule (Agregaciones y Métricas)
        │
        ▼
[ Base de Datos: MongoDB ]
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
* Node.js (v18 o superior).
* Instancia local o remota de **MongoDB** (MongoDB Atlas o local por puerto 27017).

---

### 1. Configuración del Backend (NestJS)

```bash
# Clonar el proyecto
git clone [https://github.com/mateoutn2024/SocialHub.git](https://github.com/mateoutn2024/SocialHub.git)
cd SocialHub/backend

# Instalar dependencias
npm install
```

Crea un archivo `.env` en la raíz del backend:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/socialhub
JWT_SECRET=tu_clave_secreta_para_access_token
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=tu_clave_secreta_para_refresh_token
JWT_REFRESH_EXPIRATION=7d
```

Iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

---

### 2. Configuración del Frontend (Angular)

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar servidor local
npm start
```

Navega a `http://localhost:4200/` en tu navegador.

---

## 📄 Endpoints Principales de la API (Resumen)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro de nuevos usuarios | Público |
| `POST` | `/api/auth/login` | Login, emisión de Access & Refresh Token | Público |
| `POST` | `/api/auth/refresh` | Renovación de token de sesión | Authenticated |
| `GET` | `/api/posts` | Feed paginado de publicaciones activas | Authenticated |
| `DELETE` | `/api/posts/:id` | Baja lógica de publicación (Soft Delete) | Admin / Autor |
| `GET` | `/api/analytics` | Resumen de actividad e interacciones | Admin |

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
