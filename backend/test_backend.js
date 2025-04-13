const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
require('dotenv').config();

// Función para ejecutar las pruebas
const runTests = async () => {
  try {
    console.log('Iniciando pruebas de la API del curso de coaching ontológico...');
    
    // Prueba de conexión a la API
    console.log('\n1. Prueba de conexión a la API:');
    const healthResponse = await request(app).get('/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Respuesta: ${JSON.stringify(healthResponse.body)}`);
    
    // Prueba de registro de usuario
    console.log('\n2. Prueba de registro de usuario:');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario de Prueba',
        username: 'usuarioprueba',
        email: 'prueba@ejemplo.com',
        password: 'password123'
      });
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Respuesta: ${JSON.stringify(registerResponse.body)}`);
    
    // Prueba de autenticación
    console.log('\n3. Prueba de autenticación:');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'estudiante',
        password: 'curso123'
      });
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Token recibido: ${loginResponse.body.token ? 'Sí' : 'No'}`);
    
    if (!loginResponse.body.token) {
      throw new Error('No se pudo obtener token de autenticación');
    }
    
    const token = loginResponse.body.token;
    
    // Prueba de obtención de datos de usuario
    console.log('\n4. Prueba de obtención de datos de usuario:');
    const userResponse = await request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${userResponse.status}`);
    console.log(`   Usuario: ${JSON.stringify(userResponse.body)}`);
    
    // Prueba de obtención de cursos
    console.log('\n5. Prueba de obtención de cursos:');
    const coursesResponse = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${coursesResponse.status}`);
    console.log(`   Número de cursos: ${coursesResponse.body.length || 0}`);
    
    // Prueba de autenticación como administrador
    console.log('\n6. Prueba de autenticación como administrador:');
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    console.log(`   Status: ${adminLoginResponse.status}`);
    console.log(`   Token recibido: ${adminLoginResponse.body.token ? 'Sí' : 'No'}`);
    
    if (adminLoginResponse.body.token) {
      const adminToken = adminLoginResponse.body.token;
      
      // Prueba de acceso a panel de administración
      console.log('\n7. Prueba de acceso a panel de administración:');
      const adminAccessResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      console.log(`   Status: ${adminAccessResponse.status}`);
      console.log(`   Acceso permitido: ${adminAccessResponse.status === 200 ? 'Sí' : 'No'}`);
    }
    
    // Prueba de suscripciones
    console.log('\n8. Prueba de obtención de suscripciones:');
    const subscriptionsResponse = await request(app)
      .get('/api/subscriptions/me')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${subscriptionsResponse.status}`);
    
    // Prueba de verificación de acceso a nivel
    console.log('\n9. Prueba de verificación de acceso a nivel:');
    const accessResponse = await request(app)
      .get('/api/subscriptions/access/1')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${accessResponse.status}`);
    console.log(`   Acceso: ${JSON.stringify(accessResponse.body)}`);
    
    console.log('\nResumen de pruebas:');
    console.log('- Conexión a la API: ' + (healthResponse.status === 200 ? '✅' : '❌'));
    console.log('- Registro de usuario: ' + (registerResponse.status === 201 ? '✅' : '❌'));
    console.log('- Autenticación: ' + (loginResponse.status === 200 ? '✅' : '❌'));
    console.log('- Obtención de datos de usuario: ' + (userResponse.status === 200 ? '✅' : '❌'));
    console.log('- Obtención de cursos: ' + (coursesResponse.status === 200 ? '✅' : '❌'));
    console.log('- Autenticación como admin: ' + (adminLoginResponse.status === 200 ? '✅' : '❌'));
    console.log('- Obtención de suscripciones: ' + (subscriptionsResponse.status === 200 ? '✅' : '❌'));
    console.log('- Verificación de acceso: ' + (accessResponse.status === 200 ? '✅' : '❌'));
    
    console.log('\nPruebas completadas.');
    
    return {
      success: true,
      message: 'Pruebas completadas exitosamente'
    };
  } catch (error) {
    console.error('Error durante las pruebas:', error);
    
    return {
      success: false,
      message: 'Error durante las pruebas',
      error: error.message
    };
  } finally {
    // Cerrar la aplicación después de las pruebas
    try {
      await mongoose.connection.close();
      console.log('Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('Error al cerrar la conexión:', error);
    }
  }
};

// Ejecutar las pruebas
runTests()
  .then(result => {
    console.log(result.message);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
