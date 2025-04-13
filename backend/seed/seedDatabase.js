const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Section = require('../models/Section');
const Quiz = require('../models/Quiz');
const bcrypt = require('bcryptjs');

// Seed database with initial data
module.exports = async function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Section.deleteMany({});
    await Quiz.deleteMany({});
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date()
    });
    
    // Create student user
    const studentPassword = await bcrypt.hash('curso123', 10);
    const student = new User({
      username: 'estudiante',
      email: 'estudiante@example.com',
      password: studentPassword,
      role: 'student',
      firstName: 'Estudiante',
      lastName: 'Ejemplo',
      createdAt: new Date()
    });
    
    await admin.save();
    await student.save();
    
    console.log('Users seeded successfully');
    
    // Create courses
    const courses = [
      {
        title: 'Fundamentos del Coaching Ontológico',
        description: 'Nivel básico para comprender los principios fundamentales del coaching ontológico.',
        level: 1,
        price: 497,
        duration: '8 semanas',
        imageUrl: '/images/curso-nivel1.jpg'
      },
      {
        title: 'Práctica del Coaching Ontológico',
        description: 'Nivel intermedio para desarrollar habilidades prácticas de coaching ontológico.',
        level: 2,
        price: 997,
        duration: '12 semanas',
        imageUrl: '/images/curso-nivel2.jpg'
      },
      {
        title: 'Maestría en Coaching Ontológico',
        description: 'Nivel avanzado para dominar las técnicas y convertirse en un coach ontológico profesional.',
        level: 3,
        price: 2497,
        duration: '16 semanas',
        imageUrl: '/images/curso-nivel3.jpg'
      }
    ];
    
    const savedCourses = await Course.insertMany(courses);
    console.log('Courses seeded successfully');
    
    // Create modules for the first course
    const modulesLevel1 = [
      {
        title: 'Introducción al Coaching Ontológico',
        description: 'Fundamentos y principios básicos del coaching ontológico.',
        courseId: savedCourses[0]._id,
        order: 1
      },
      {
        title: 'Los Dominios del Ser',
        description: 'Exploración de los dominios del cuerpo, emoción y lenguaje.',
        courseId: savedCourses[0]._id,
        order: 2
      },
      {
        title: 'Competencias Clave según ICF',
        description: 'Estudio de las competencias fundamentales definidas por la ICF.',
        courseId: savedCourses[0]._id,
        order: 3
      }
    ];
    
    const savedModules = await Module.insertMany(modulesLevel1);
    console.log('Modules seeded successfully');
    
    // Create sections for the first module
    const sectionsModule1 = [
      {
        title: '¿Qué es el Coaching Ontológico?',
        content: 'El coaching ontológico es una disciplina que facilita el proceso de aprendizaje y transformación personal y profesional, basado en la manera en que interpretamos el mundo a través del lenguaje.',
        moduleId: savedModules[0]._id,
        order: 1,
        videoUrl: 'https://www.youtube.com/embed/43S9sPRbgnw'
      },
      {
        title: 'Orígenes y Fundamentos',
        content: 'El coaching ontológico tiene sus raíces en la filosofía de Martin Heidegger, la biología del conocimiento de Humberto Maturana y la lingüística de John Austin y John Searle.',
        moduleId: savedModules[0]._id,
        order: 2,
        videoUrl: 'https://www.youtube.com/embed/EJkmOjffFwo'
      },
      {
        title: 'El Observador y la Acción',
        content: 'En el coaching ontológico, entendemos que cada persona actúa según su manera particular de observar el mundo. Cambiar nuestra forma de observar nos permite acceder a nuevas acciones y resultados.',
        moduleId: savedModules[0]._id,
        order: 3,
        videoUrl: 'https://www.youtube.com/embed/43S9sPRbgnw'
      }
    ];
    
    await Section.insertMany(sectionsModule1);
    console.log('Sections seeded successfully');
    
    // Create quiz for the first module
    const quizModule1 = new Quiz({
      title: 'Evaluación: Fundamentos del Coaching Ontológico',
      moduleId: savedModules[0]._id,
      questions: [
        {
          question: '¿Cuál es el papel del lenguaje en el coaching ontológico?',
          options: [
            'Es simplemente un medio de comunicación',
            'Es una herramienta generativa que crea realidades',
            'Es irrelevante para el proceso de coaching',
            'Es útil solo para dar instrucciones'
          ],
          correctAnswer: 1,
          explanation: 'En el coaching ontológico, el lenguaje no solo describe la realidad sino que la genera y transforma.'
        },
        {
          question: '¿Qué significa ser un observador en el contexto del coaching ontológico?',
          options: [
            'Alguien que mira pasivamente',
            'Una persona que juzga a otros',
            'Un ser que interpreta el mundo desde su propia perspectiva',
            'Alguien que solo observa sin participar'
          ],
          correctAnswer: 2,
          explanation: 'Ser un observador implica que interpretamos el mundo desde nuestra propia perspectiva, influenciada por nuestra historia, creencias y emociones.'
        },
        {
          question: '¿Cómo se relacionan las acciones con el observador que somos?',
          options: [
            'No hay relación entre ambos',
            'Nuestras acciones son independientes de nuestra forma de observar',
            'Nuestras acciones están determinadas por factores externos',
            'Las acciones que tomamos son coherentes con el observador que somos'
          ],
          correctAnswer: 3,
          explanation: 'En el coaching ontológico, entendemos que las acciones que tomamos son coherentes con el observador que somos. Si queremos nuevas acciones, necesitamos transformar al observador.'
        }
      ]
    });
    
    await quizModule1.save();
    console.log('Quizzes seeded successfully');
    
    console.log('Database seeded successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
