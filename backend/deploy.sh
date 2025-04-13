#!/bin/bash

# Script para desplegar la aplicación completa del curso de coaching ontológico

echo "=== Iniciando despliegue de la aplicación del curso de coaching ontológico ==="
echo "Fecha: $(date)"
echo

# Configurar variables de entorno
export NODE_ENV=production
export PORT=5000
export MONGODB_URI="mongodb://localhost:27017/curso_coaching_ontologico"
export JWT_SECRET="curso_coaching_ontologico_secret_key_2025"

# Directorio base
BASE_DIR="/home/ubuntu"
BACKEND_DIR="$BASE_DIR/curso_coaching_node_backend"
FRONTEND_DIR="$BASE_DIR/curso_coaching_react_app"

echo "=== Preparando backend ==="
cd $BACKEND_DIR

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
npm install

# Crear directorio para archivos públicos
mkdir -p public

# Poblar la base de datos con datos iniciales
echo "Poblando la base de datos con datos iniciales..."
node seed_database.js

# Ejecutar pruebas del backend
echo "Ejecutando pruebas del backend..."
node test_backend.js

echo "=== Preparando frontend ==="
cd $FRONTEND_DIR

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
npm install

# Construir la aplicación React
echo "Construyendo la aplicación React..."
npm run build

# Copiar archivos de build al directorio público del backend
echo "Copiando archivos de frontend al backend..."
cp -r build/* $BACKEND_DIR/public/

echo "=== Iniciando servidor ==="
cd $BACKEND_DIR

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
