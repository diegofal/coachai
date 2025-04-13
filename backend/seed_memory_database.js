const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Section = require('./models/Section');
const Quiz = require('./models/Quiz');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Datos iniciales para la base de datos
const initialData = {
  // Usuarios iniciales
  users: [
    {
      name: 'Administrador',
      username: 'admin',
      email: 'admin@coachingontologico.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'Estudiante Demo',
      username: 'estudiante',
      email: 'estudiante@coachingontologico.com',
      password: 'curso123',
      role: 'student'
    }
  ],
  
  // Cursos iniciales
  courses: [
    {
      title: 'Fundamentos del Coaching Ontológico',
      description: 'Curso básico que introduce los conceptos fundamentales del coaching ontológico y las competencias de la ICF.',
      level: 1,
      price: 497
    },
    {
      title: 'Práctica del Coaching Ontológico',
      description: 'Curso intermedio que profundiza en las técnicas y herramientas del coaching ontológico para la práctica profesional.',
      level: 2,
      price: 997
    },
    {
      title: 'Maestría en Coaching Ontológico',
      description: 'Curso avanzado para dominar el coaching ontológico y prepararse para la certificación ICF.',
      level: 3,
      price: 2497
    }
  ],
  
  // Módulos para el curso nivel 1
  modulesLevel1: [
    {
      title: 'Introducción al Coaching Ontológico',
      description: 'Fundamentos y principios del coaching ontológico.',
      order: 1
    },
    {
      title: 'Los Dominios del Ser',
      description: 'Comprensión de los tres dominios: cuerpo, emoción y lenguaje.',
      order: 2
    },
    {
      title: 'Competencias Clave según ICF',
      description: 'Las competencias fundamentales del coaching según la ICF.',
      order: 3
    },
    {
      title: 'Herramientas Básicas del Coaching',
      description: 'Técnicas y herramientas esenciales para el coaching ontológico.',
      order: 4
    },
    {
      title: 'Práctica Básica de Coaching',
      description: 'Ejercicios prácticos para desarrollar habilidades de coaching.',
      order: 5
    },
    {
      title: 'Evaluación y Certificación Nivel 1',
      description: 'Evaluación final del nivel básico.',
      order: 6
    }
  ]
};

// Función para poblar la base de datos
const seedDatabase = async () => {
  let mongod;
  
  try {
    console.log('Iniciando MongoDB Memory Server...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Actualizar la variable de entorno para que la aplicación use esta URI
    process.env.MONGODB_URI = uri;
    console.log(`MongoDB Memory Server iniciado en: ${uri}`);
    
    console.log('Conectando a la base de datos...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conexión exitosa a MongoDB Memory Server');
    
    // Limpiar colecciones existentes
    console.log('Limpiando colecciones existentes...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Section.deleteMany({});
    await Quiz.deleteMany({});
    
    // Crear usuarios
    console.log('Creando usuarios iniciales...');
    const createdUsers = [];
    
    for (const userData of initialData.users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`  - Usuario creado: ${userData.username} (${userData.role})`);
    }
    
    // Crear cursos
    console.log('Creando cursos iniciales...');
    const createdCourses = [];
    
    for (const courseData of initialData.courses) {
      const course = new Course({
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        price: courseData.price
      });
      
      const savedCourse = await course.save();
      createdCourses.push(savedCourse);
      console.log(`  - Curso creado: ${courseData.title} (Nivel ${courseData.level})`);
    }
    
    // Crear módulos para el curso nivel 1
    console.log('Creando módulos para el curso nivel 1...');
    const courseLevel1 = createdCourses.find(course => course.level === 1);
    const createdModules = [];
    
    for (const moduleData of initialData.modulesLevel1) {
      const module = new Module({
        title: moduleData.title,
        description: moduleData.description,
        courseId: courseLevel1._id,
        order: moduleData.order
      });
      
      const savedModule = await module.save();
      createdModules.push(savedModule);
      console.log(`  - Módulo creado: ${moduleData.title}`);
      
      // Actualizar el curso con el módulo
      await Course.findByIdAndUpdate(
        courseLevel1._id,
        { $push: { modules: savedModule._id } }
      );
    }
    
    // Crear secciones para el primer módulo
    console.log('Creando secciones para el primer módulo...');
    const firstModule = createdModules[0];
    
    const sections = [
      {
        title: '¿Qué es el Coaching Ontológico?',
        content: 'El coaching ontológico es una disciplina que facilita el proceso de aprendizaje y transformación personal y profesional, basado en la ontología del lenguaje. Se centra en el ser (ontología) y cómo este se constituye a través del lenguaje, las emociones y el cuerpo.',
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/EJkmOjffFwo'
      },
      {
        title: 'Orígenes y Fundamentos',
        content: 'El coaching ontológico tiene sus raíces en la filosofía, la lingüística y la biología del conocimiento. Fue desarrollado principalmente por Fernando Flores, Rafael Echeverría y Julio Olalla, basándose en los trabajos de Heidegger, Maturana y Austin.',
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/43S9sPRbgnw'
      },
      {
        title: 'El Observador y la Acción',
        content: 'Un concepto fundamental del coaching ontológico es que actuamos según nuestras interpretaciones (observador). Cambiar nuestra forma de observar nos permite generar nuevas acciones y resultados.',
        order: 3,
        videoUrl: 'https://www.youtube.com/embed/HGu7NVjIorM'
      }
    ];
    
    for (const sectionData of sections) {
      const section = new Section({
        title: sectionData.title,
        content: sectionData.content,
        moduleId: firstModule._id,
        order: sectionData.order,
        videoUrl: sectionData.videoUrl,
        resources: [
          {
            title: 'Guía de Competencias ICF',
            url: '/recursos/guia_competencias_icf.pdf',
            type: 'pdf'
          }
        ]
      });
      
      const savedSection = await section.save();
      console.log(`  - Sección creada: ${sectionData.title}`);
      
      // Actualizar el módulo con la sección
      await Module.findByIdAndUpdate(
        firstModule._id,
        { $push: { sections: savedSection._id } }
      );
    }
    
    // Crear quiz para el primer módulo
    console.log('Creando quiz para el primer módulo...');
    const firstSection = await Section.findOne({ moduleId: firstModule._id, order: 1 });
    
    const quiz = new Quiz({
      title: 'Evaluación: Introducción al Coaching Ontológico',
      description: 'Evalúa tu comprensión de los conceptos básicos del coaching ontológico.',
      sectionId: firstSection._id,
      passingScore: 70,
      questions: [
        {
          text: '¿Cuál es el enfoque principal del coaching ontológico?',
          options: [
            'Mejorar el rendimiento deportivo',
            'El ser y cómo se constituye a través del lenguaje, las emociones y el cuerpo',
            'Técnicas de venta y persuasión',
            'La programación de hábitos productivos'
          ],
          correctAnswer: 1,
          explanation: 'El coaching ontológico se centra en el ser (ontología) y cómo este se constituye a través del lenguaje, las emociones y el cuerpo.'
        },
        {
          text: '¿Quiénes son considerados los principales desarrolladores del coaching ontológico?',
          options: [
            'Tony Robbins y Jim Rohn',
            'Carl Jung y Sigmund Freud',
            'Fernando Flores, Rafael Echeverría y Julio Olalla',
            'John Whitmore y Timothy Gallwey'
          ],
          correctAnswer: 2,
          explanation: 'Fernando Flores, Rafael Echeverría y Julio Olalla son considerados los principales desarrolladores del coaching ontológico, basándose en trabajos de Heidegger, Maturana y Austin.'
        },
        {
          text: '¿Qué relación existe entre el observador y la acción según el coaching ontológico?',
          options: [
            'No existe relación entre ambos conceptos',
            'El observador debe ser siempre objetivo y neutral',
            'Actuamos según nuestras interpretaciones como observadores',
            'El observador solo puede modificar acciones físicas'
          ],
          correctAnswer: 2,
          explanation: 'Según el coaching ontológico, actuamos según nuestras interpretaciones como observadores. Cambiar nuestra forma de observar nos permite generar nuevas acciones y resultados.'
        }
      ]
    });
    
    const savedQuiz = await quiz.save();
    console.log('  - Quiz creado para el primer módulo');
    
    // Actualizar la sección con el quiz
    await Section.findByIdAndUpdate(
      firstSection._id,
      { quizId: savedQuiz._id }
    );
    
    console.log('\nBase de datos poblada exitosamente');
    console.log(`Usuarios creados: ${createdUsers.length}`);
    console.log(`Cursos creados: ${createdCourses.length}`);
    console.log(`Módulos creados: ${createdModules.length}`);
    
    // Guardar la URI de MongoDB Memory Server en un archivo para que el servidor pueda usarla
    const fs = require('fs');
    fs.writeFileSync('./.mongodb-memory-server-uri', uri);
    console.log('URI de MongoDB Memory Server guardada en .mongodb-memory-server-uri');
    
    return {
      success: true,
      message: 'Base de datos poblada exitosamente',
      uri: uri
    };
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    
    return {
      success: false,
      message: 'Error al poblar la base de datos',
      error: error.message
    };
  }
};

// Ejecutar la función de población
seedDatabase()
  .then(result => {
    console.log(result.message);
    if (result.uri) {
      console.log(`MongoDB Memory Server URI: ${result.uri}`);
    }
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
