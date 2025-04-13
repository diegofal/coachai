const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Quiz = require('../models/Quiz');
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

// Obtener todas las secciones
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener secciones', 
      error: error.message 
    });
  }
});

// Obtener una sección por ID
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener sección', 
      error: error.message 
    });
  }
});

// Crear una nueva sección (solo admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, content, moduleId, order, videoUrl, resources } = req.body;
    
    const section = new Section({
      title,
      content,
      moduleId,
      order,
      videoUrl,
      resources
    });
    
    await section.save();
    
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear sección', 
      error: error.message 
    });
  }
});

// Actualizar una sección (solo admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, content, order, videoUrl, resources } = req.body;
    
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        order,
        videoUrl,
        resources,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar sección', 
      error: error.message 
    });
  }
});

// Eliminar una sección (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const section = await Section.findByIdAndDelete(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }
    
    // Eliminar quiz asociado si existe
    if (section.quizId) {
      await Quiz.findByIdAndDelete(section.quizId);
    }
    
    res.json({ message: 'Sección eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar sección', 
      error: error.message 
    });
  }
});

module.exports = router;
