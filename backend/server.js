const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Verificar si existe el archivo con la URI de MongoDB Memory Server
let mongodbUri = process.env.MONGODB_URI;
if (fs.existsSync('./.mongodb-memory-server-uri')) {
  mongodbUri = fs.readFileSync('./.mongodb-memory-server-uri', 'utf8');
  console.log('Usando MongoDB Memory Server URI desde archivo:', mongodbUri);
}

// Configurar opciones de conexión de MongoDB
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Función para conectar a MongoDB
const connectToMongoDB = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(mongodbUri, mongooseOptions);
    console.log('Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    console.log('El servidor seguirá funcionando sin conexión a MongoDB');
    console.log('Para solucionar esto:');
    console.log('1. Asegúrate de que MongoDB esté instalado y ejecutándose');
    console.log('2. Verifica que la URI de conexión sea correcta en el archivo .env');
    console.log('3. Si estás usando MongoDB Atlas, verifica que la IP esté permitida en la configuración de red');
  }
};

// Crear directorio public si no existe
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
  
  // Crear un archivo index.html básico
  const indexHtml = `
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
  `;
  
  fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), indexHtml);
  console.log('Archivo index.html creado en el directorio public');
}

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
  connectToMongoDB();
});

module.exports = app;
