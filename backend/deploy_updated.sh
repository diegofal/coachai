#!/bin/bash

# Script para desplegar la aplicación completa del curso de coaching ontológico

echo "=== Iniciando despliegue de la aplicación del curso de coaching ontológico ==="
echo "Fecha: $(date)"
echo

# Configurar variables de entorno
export NODE_ENV=production
export PORT=5000
export MONGODB_URI="mongodb+srv://curso_coaching:coaching123@cluster0.mongodb.net/curso_coaching_ontologico?retryWrites=true&w=majority"
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
npm install mongodb mongoose express cors jsonwebtoken bcryptjs dotenv

# Crear directorio para archivos públicos
mkdir -p public

# Verificar conexión a MongoDB
echo "Verificando conexión a MongoDB..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
  process.exit(0);
})
.catch(err => {
  console.error('Error al conectar a MongoDB:', err.message);
  process.exit(1);
});"

if [ $? -ne 0 ]; then
  echo "Error: No se pudo conectar a MongoDB. Abortando despliegue."
  exit 1
fi

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
  echo "Error: No se encontró la carpeta de build del frontend. Abortando despliegue."
  exit 1
fi

echo "=== Iniciando servidor ==="
cd $BACKEND_DIR

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
