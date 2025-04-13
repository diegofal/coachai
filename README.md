# Curso de Coaching Ontológico

Aplicación web completa para un curso de coaching ontológico basado en los estándares de la ICF (International Coach Federation).

## Descripción

Esta aplicación proporciona una plataforma completa para ofrecer cursos de coaching ontológico en tres niveles:

- **Nivel 1: Fundamentos del Coaching Ontológico** ($497)
- **Nivel 2: Práctica del Coaching Ontológico** ($997)
- **Nivel 3: Maestría en Coaching Ontológico** ($2,497)

La aplicación incluye un sistema de autenticación, gestión de usuarios, seguimiento de progreso, evaluaciones interactivas y contenido multimedia.

## Tecnologías Utilizadas

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Contenedorización**: Docker

## Estructura del Proyecto

```
curso_coaching_git/
├── backend/             # Servidor Node.js/Express
│   ├── middleware/      # Middleware de autenticación y autorización
│   ├── models/          # Modelos de datos MongoDB
│   ├── routes/          # Rutas de la API
│   ├── Dockerfile       # Configuración Docker para producción
│   └── server.js        # Punto de entrada del servidor
├── frontend/            # Aplicación React
│   ├── public/          # Archivos estáticos
│   ├── src/             # Código fuente React
│   │   ├── components/  # Componentes React
│   │   ├── context/     # Contextos (Auth, etc.)
│   │   └── hooks/       # Custom hooks
│   ├── Dockerfile       # Configuración Docker para producción
│   ├── Dockerfile.dev   # Configuración Docker para desarrollo
│   └── nginx.conf       # Configuración de Nginx para producción
├── docs/                # Documentación adicional
├── docker-compose.yml         # Configuración Docker Compose para producción
├── docker-compose.dev.yml     # Configuración Docker Compose para desarrollo
└── package.json               # Configuración del monorepo
```

## Requisitos Previos

- Docker y Docker Compose
- Node.js 20.x o superior (solo para desarrollo local sin Docker)
- MongoDB (solo para desarrollo local sin Docker)

## Instalación y Ejecución

### Usando Docker (Recomendado)

#### Entorno de Desarrollo

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd curso_coaching_git
   ```

2. Inicia los contenedores de desarrollo:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Accede a la aplicación:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MongoDB: mongodb://localhost:27017/curso_coaching_ontologico

#### Entorno de Producción

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd curso_coaching_git
   ```

2. Inicia los contenedores de producción:
   ```bash
   docker-compose up -d
   ```

3. Accede a la aplicación:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api

### Desarrollo Local (Sin Docker)

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd curso_coaching_git
   ```

2. Instala las dependencias:
   ```bash
   npm run install:all
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta `backend` basado en el ejemplo
   - Crea un archivo `.env` en la carpeta `frontend` basado en el ejemplo

4. Inicia MongoDB localmente o usa MongoDB Atlas

5. Inicia el backend:
   ```bash
   cd backend
   npm start
   ```

6. Inicia el frontend (en otra terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. Accede a la aplicación:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Credenciales de Prueba

La aplicación viene con dos usuarios predefinidos para pruebas:

1. **Usuario Estudiante**:
   - Usuario: `estudiante`
   - Contraseña: `curso123`

2. **Usuario Administrador**:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Funcionalidades Principales

- **Sistema de Autenticación**: Registro, login y gestión de sesiones
- **Panel de Estudiante**: Acceso a módulos, seguimiento de progreso
- **Panel de Administrador**: Gestión de usuarios y suscripciones
- **Contenido del Curso**: Módulos organizados por nivel con contenido multimedia
- **Sistema de Evaluación**: Quizzes interactivos con retroalimentación
- **Suscripciones**: Tres niveles de curso con diferentes precios

## Estructura de la Base de Datos

La aplicación utiliza MongoDB con los siguientes modelos principales:

- **User**: Información de usuarios y autenticación
- **Course**: Información de los cursos disponibles
- **Module**: Módulos de cada curso
- **Section**: Secciones de contenido dentro de cada módulo
- **Quiz**: Evaluaciones para cada módulo
- **Progress**: Seguimiento del progreso de los estudiantes
- **Subscription**: Gestión de suscripciones de usuarios a cursos

## Desarrollo y Contribución

1. Crea una rama para tu funcionalidad:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Realiza tus cambios y haz commit:
   ```bash
   git commit -m "Añadir nueva funcionalidad"
   ```

3. Envía tus cambios:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. Crea un Pull Request

## Licencia

Este proyecto está licenciado bajo [ISC License](LICENSE).
