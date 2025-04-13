const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization').replace('Bearer ', '');
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error();
    }
    
    // Adjuntar usuario a la solicitud
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'No autorizado' });
  }
};

// Obtener todos los quizzes
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Solo admin puede ver todos los quizzes
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener quizzes', 
      error: error.message 
    });
  }
});

// Obtener un quiz por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener quiz', 
      error: error.message 
    });
  }
});

// Crear un nuevo quiz (solo admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, sectionId, passingScore, questions } = req.body;
    
    const quiz = new Quiz({
      title,
      description,
      sectionId,
      passingScore,
      questions
    });
    
    await quiz.save();
    
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear quiz', 
      error: error.message 
    });
  }
});

// Actualizar un quiz (solo admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, passingScore, questions } = req.body;
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        passingScore,
        questions,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar quiz', 
      error: error.message 
    });
  }
});

// Eliminar un quiz (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    
    // Eliminar resultados asociados
    await QuizResult.deleteMany({ quizId: req.params.id });
    
    res.json({ message: 'Quiz eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar quiz', 
      error: error.message 
    });
  }
});

// Enviar respuestas de quiz
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user._id;
    
    // Obtener quiz
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    
    // Calcular puntuación
    let correctCount = 0;
    const answersWithResults = [];
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      answersWithResults.push({
        questionIndex: i,
        answerIndex: userAnswer,
        isCorrect
      });
    }
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    // Guardar resultado
    const quizResult = new QuizResult({
      userId,
      quizId: quiz._id,
      sectionId: quiz.sectionId,
      moduleId: req.body.moduleId,
      score,
      passed,
      answers: answersWithResults
    });
    
    await quizResult.save();
    
    res.json({
      score,
      passed,
      passingScore: quiz.passingScore,
      answers: answersWithResults
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al enviar respuestas', 
      error: error.message 
    });
  }
});

// Obtener resultados de quiz para un usuario
router.get('/results/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Verificar si es el propio usuario o un admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const results = await QuizResult.find({ userId: req.params.userId })
      .sort({ completionDate: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener resultados', 
      error: error.message 
    });
  }
});

module.exports = router;
