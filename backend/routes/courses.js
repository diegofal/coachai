const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

// Middleware para verificar token (importado desde auth.js)
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

// Obtener todos los cursos
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().select('-modules');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener cursos', 
      error: error.message 
    });
  }
});

// Obtener un curso por ID con sus módulos
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'modules',
      options: { sort: { order: 1 } }
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener curso', 
      error: error.message 
    });
  }
});

// Crear un nuevo curso (solo admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, level, price } = req.body;
    
    const course = new Course({
      title,
      description,
      level,
      price
    });
    
    await course.save();
    
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear curso', 
      error: error.message 
    });
  }
});

// Actualizar un curso (solo admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, level, price } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        level,
        price,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar curso', 
      error: error.message 
    });
  }
});

// Eliminar un curso (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Eliminar módulos asociados
    await Module.deleteMany({ courseId: req.params.id });
    
    res.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar curso', 
      error: error.message 
    });
  }
});

module.exports = router;
