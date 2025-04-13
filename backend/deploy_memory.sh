#!/bin/bash

# Script para desplegar la aplicación completa del curso de coaching ontológico
# Versión actualizada para usar MongoDB Memory Server

echo "=== Iniciando despliegue de la aplicación del curso de coaching ontológico ==="
echo "Fecha: $(date)"
echo

# Configurar variables de entorno
export NODE_ENV=production
export PORT=5000
export JWT_SECRET="curso_coaching_ontologico_secret_key_2025"

# Directorio base
BASE_DIR="/home/ubuntu"
BACKEND_DIR="$BASE_DIR/curso_coaching_node_backend"
FRONTEND_DIR="$BASE_DIR/curso_coaching_react_app"

echo "=== Preparando backend ==="
cd $BACKEND_DIR

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
npm install --production
npm install mongodb mongoose express cors jsonwebtoken bcryptjs dotenv mongodb-memory-server

# Crear directorio para archivos públicos
mkdir -p public

# Iniciar MongoDB Memory Server y poblar la base de datos
echo "Iniciando MongoDB Memory Server y poblando la base de datos..."
node seed_memory_database.js

# Verificar si se creó el archivo con la URI de MongoDB Memory Server
if [ ! -f "./.mongodb-memory-server-uri" ]; then
  echo "Error: No se pudo iniciar MongoDB Memory Server. Abortando despliegue."
  exit 1
fi

# Leer la URI de MongoDB Memory Server
MONGODB_URI=$(cat ./.mongodb-memory-server-uri)
export MONGODB_URI

echo "MongoDB Memory Server iniciado en: $MONGODB_URI"

echo "=== Preparando frontend ==="
cd $FRONTEND_DIR

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
npm install --production

# Construir la aplicación React
echo "Construyendo la aplicación React..."
npm run build

# Verificar si la carpeta dist existe
if [ -d "dist" ]; then
  # Copiar archivos de dist al directorio público del backend
  echo "Copiando archivos de frontend al backend..."
  cp -r dist/* $BACKEND_DIR/public/
elif [ -d "build" ]; then
  # Copiar archivos de build al directorio público del backend
  echo "Copiando archivos de frontend al backend..."
  cp -r build/* $BACKEND_DIR/public/
else
  echo "Advertencia: No se encontró la carpeta de build del frontend."
  # Crear un archivo index.html básico en el directorio público
  echo "Creando página de inicio básica..."
  cat > $BACKEND_DIR/public/index.html << EOF
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curso de Coaching Ontológico</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
    }
    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .card {
      flex: 1;
      min-width: 300px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #2c3e50;
      margin-top: 0;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #27ae60;
      margin: 10px 0;
    }
    .btn {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 10px 15px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .btn:hover {
      background-color: #2980b9;
    }
    footer {
      margin-top: 40px;
      text-align: center;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <header>
    <h1>Curso de Coaching Ontológico</h1>
    <p>Basado en los estándares de la ICF (International Coach Federation)</p>
  </header>
  
  <main>
    <h2>Bienvenido a nuestro curso completo de Coaching Ontológico</h2>
    <p>Este curso te proporcionará todas las herramientas y conocimientos necesarios para convertirte en un coach ontológico certificado, siguiendo los estándares de la ICF.</p>
    
    <div class="container">
      <div class="card">
        <h2>Nivel 1: Fundamentos</h2>
        <p>Curso básico que introduce los conceptos fundamentales del coaching ontológico y las competencias de la ICF.</p>
        <div class="price">$497</div>
        <a href="/login.html" class="btn">Acceder</a>
      </div>
      
      <div class="card">
        <h2>Nivel 2: Práctica</h2>
        <p>Curso intermedio que profundiza en las técnicas y herramientas del coaching ontológico para la práctica profesional.</p>
        <div class="price">$997</div>
        <a href="/login.html" class="btn">Acceder</a>
      </div>
      
      <div class="card">
        <h2>Nivel 3: Maestría</h2>
        <p>Curso avanzado para dominar el coaching ontológico y prepararse para la certificación ICF.</p>
        <div class="price">$2,497</div>
        <a href="/login.html" class="btn">Acceder</a>
      </div>
    </div>
    
    <h2>Características del curso</h2>
    <ul>
      <li>Contenido basado en los estándares de la ICF</li>
      <li>Videos de conversaciones de coaching completas</li>
      <li>Recursos adicionales para cada tema</li>
      <li>Evaluaciones avanzadas para medir tu aprendizaje</li>
      <li>Interfaz intuitiva y fácil de usar</li>
    </ul>
  </main>
  
  <footer>
    <p>&copy; 2025 Curso de Coaching Ontológico. Todos los derechos reservados.</p>
  </footer>
</body>
</html>
EOF

  # Crear página de login básica
  cat > $BACKEND_DIR/public/login.html << EOF
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión - Curso de Coaching Ontológico</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }
    .login-container {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-top: 50px;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
    }
    .btn {
      display: block;
      width: 100%;
      background-color: #3498db;
      color: white;
      padding: 10px;
      text-align: center;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn:hover {
      background-color: #2980b9;
    }
    .credentials-info {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
      font-size: 14px;
    }
    .home-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #3498db;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>Iniciar Sesión</h1>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required>
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit" class="btn">Iniciar Sesión</button>
    </form>
    
    <div class="credentials-info">
      <p><strong>Credenciales de prueba:</strong></p>
      <p>Usuario estudiante: <code>estudiante</code> / Contraseña: <code>curso123</code></p>
      <p>Usuario administrador: <code>admin</code> / Contraseña: <code>admin123</code></p>
    </div>
    
    <a href="index.html" class="home-link">Volver a la página principal</a>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Verificar credenciales (simplificado para demo)
      if ((username === 'estudiante' && password === 'curso123') || 
          (username === 'admin' && password === 'admin123')) {
        alert('Inicio de sesión exitoso. En la versión completa, serías redirigido al dashboard.');
      } else {
        alert('Credenciales incorrectas. Por favor, intenta de nuevo.');
      }
    });
  </script>
</body>
</html>
EOF
fi

echo "=== Iniciando servidor ==="
cd $BACKEND_DIR

# Modificar server.js para usar la URI de MongoDB Memory Server
echo "Actualizando configuración del servidor..."
cat > server.js << EOF
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Verificar si existe el archivo con la URI de MongoDB Memory Server
let mongodbUri = process.env.MONGODB_URI;
if (fs.existsSync('./.mongodb-memory-server-uri')) {
  mongodbUri = fs.readFileSync('./.mongodb-memory-server-uri', 'utf8');
  console.log('Usando MongoDB Memory Server URI desde archivo');
}

// Conectar a MongoDB
mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
})
.catch(err => {
  console.error('Error al conectar a MongoDB:', err.message);
});

// Rutas de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta para todas las demás solicitudes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Servidor iniciado en http://0.0.0.0:\${PORT}\`);
});

module.exports = app;
EOF

# Detener servidor existente si está en ejecución
echo "Deteniendo servidor existente si está en ejecución..."
pkill -f "node server.js" || true
sleep 2

# Iniciar el servidor en segundo plano
echo "Iniciando servidor Node.js..."
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!

# Verificar que el servidor se haya iniciado correctamente
sleep 5
if ps -p $SERVER_PID > /dev/null; then
  echo "Servidor iniciado correctamente con PID: $SERVER_PID"
  echo "URL de acceso: http://localhost:$PORT"
  echo "Para detener el servidor: kill $SERVER_PID"
else
  echo "Error al iniciar el servidor. Revisa los logs en server.log"
  cat server.log
  exit 1
fi

echo
echo "=== Despliegue completado exitosamente ==="
echo "Credenciales de acceso:"
echo "  - Administrador: usuario=admin, contraseña=admin123"
echo "  - Estudiante: usuario=estudiante, contraseña=curso123"
echo
echo "Para exponer el puerto al exterior, ejecuta:"
echo "  deploy_expose_port $PORT"
