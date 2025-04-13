const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
require('dotenv').config();

// Función para ejecutar las pruebas
const runTests = async () => {
  try {
    console.log('Iniciando pruebas de la aplicación...');
    
    // Prueba de conexión a la API
    console.log('\n1. Prueba de conexión a la API:');
    const healthResponse = await request(app).get('/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Respuesta: ${JSON.stringify(healthResponse.body)}`);
    
    // Prueba de autenticación
    console.log('\n2. Prueba de autenticación:');
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
    console.log('\n3. Prueba de obtención de datos de usuario:');
    const userResponse = await request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${userResponse.status}`);
    console.log(`   Usuario: ${userResponse.body.name} (${userResponse.body.email})`);
    
    // Prueba de obtención de cursos
    console.log('\n4. Prueba de obtención de cursos:');
    const coursesResponse = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${coursesResponse.status}`);
    console.log(`   Número de cursos: ${coursesResponse.body.length}`);
    
    // Prueba de obtención de módulos
    console.log('\n5. Prueba de obtención de módulos:');
    if (coursesResponse.body.length > 0) {
      const courseId = coursesResponse.body[0]._id;
      const modulesResponse = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`);
      console.log(`   Status: ${modulesResponse.status}`);
      console.log(`   Número de módulos: ${modulesResponse.body.modules.length}`);
    } else {
      console.log('   No hay cursos disponibles para probar módulos');
    }
    
    // Prueba de acceso a panel de administración (con usuario estudiante)
    console.log('\n6. Prueba de acceso a panel de administración (con usuario estudiante):');
    const adminAccessResponse = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    console.log(`   Status: ${adminAccessResponse.status}`);
    console.log(`   Acceso permitido: ${adminAccessResponse.status === 200 ? 'Sí' : 'No'}`);
    
    // Prueba de autenticación como administrador
    console.log('\n7. Prueba de autenticación como administrador:');
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
      
      // Prueba de acceso a panel de administración (con usuario admin)
      console.log('\n8. Prueba de acceso a panel de administración (con usuario admin):');
      const adminAccessResponse2 = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      console.log(`   Status: ${adminAccessResponse2.status}`);
      console.log(`   Acceso permitido: ${adminAccessResponse2.status === 200 ? 'Sí' : 'No'}`);
      console.log(`   Número de usuarios: ${adminAccessResponse2.body.length}`);
    }
    
    // Prueba de registro de progreso
    console.log('\n9. Prueba de registro de progreso:');
    const progressResponse = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({
        moduleId: '60a1b2c3d4e5f6a7b8c9d0e1', // ID ficticio
        sectionId: '70a1b2c3d4e5f6a7b8c9d0e1', // ID ficticio
        completed: true
      });
    console.log(`   Status: ${progressResponse.status}`);
    
    console.log('\nResumen de pruebas:');
    console.log('- Conexión a la API: ' + (healthResponse.status === 200 ? '✅' : '❌'));
    console.log('- Autenticación: ' + (loginResponse.status === 200 ? '✅' : '❌'));
    console.log('- Obtención de datos de usuario: ' + (userResponse.status === 200 ? '✅' : '❌'));
    console.log('- Obtención de cursos: ' + (coursesResponse.status === 200 ? '✅' : '❌'));
    
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
      process.exit(0);
    } catch (error) {
      console.error('Error al cerrar la conexión:', error);
      process.exit(1);
    }
  }
};

// Ejecutar las pruebas
runTests()
  .then(result => {
    console.log(result.message);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
