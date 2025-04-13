const mongoose = require('mongoose');
const User = require('./models/User');
const Progress = require('./models/Progress');
const QuizResult = require('./models/QuizResult');
require('dotenv').config();

// Función para resetear el progreso de todos los estudiantes
const resetStudentProgress = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conexión exitosa a MongoDB');
    
    // Obtener todos los usuarios con rol de estudiante
    const students = await User.find({ role: 'student' });
    console.log(`Se encontraron ${students.length} estudiantes`);
    
    // Para cada estudiante, eliminar su progreso y resultados de quizzes
    for (const student of students) {
      console.log(`Reseteando progreso para el estudiante: ${student.name} (${student.email})`);
      
      // Eliminar registros de progreso
      const deletedProgress = await Progress.deleteMany({ userId: student._id });
      console.log(`  - Registros de progreso eliminados: ${deletedProgress.deletedCount}`);
      
      // Eliminar resultados de quizzes
      const deletedQuizResults = await QuizResult.deleteMany({ userId: student._id });
      console.log(`  - Resultados de quizzes eliminados: ${deletedQuizResults.deletedCount}`);
      
      // Actualizar la fecha de último acceso a null
      await User.updateOne(
        { _id: student._id },
        { $set: { lastLogin: null } }
      );
      console.log('  - Fecha de último acceso reseteada');
    }
    
    console.log('Proceso de reseteo completado exitosamente');
    
    // Cerrar conexión a la base de datos
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada');
    
    return {
      success: true,
      message: `Se ha reseteado el progreso de ${students.length} estudiantes`
    };
  } catch (error) {
    console.error('Error al resetear el progreso de los estudiantes:', error);
    
    // Intentar cerrar la conexión en caso de error
    try {
      await mongoose.connection.close();
      console.log('Conexión a la base de datos cerrada después de error');
    } catch (closeError) {
      console.error('Error al cerrar la conexión a la base de datos:', closeError);
    }
    
    return {
      success: false,
      message: 'Error al resetear el progreso de los estudiantes',
      error: error.message
    };
  }
};

// Ejecutar la función de reseteo
resetStudentProgress()
  .then(result => {
    console.log(result.message);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
