const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Section = require('../models/Section');
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

// Obtener todos los módulos
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find().sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener módulos', 
      error: error.message 
    });
  }
});

// Obtener un módulo por ID con sus secciones
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    
    // Obtener secciones del módulo
    const sections = await Section.find({ 
      moduleId: req.params.id 
    }).sort({ order: 1 });
    
    // Añadir secciones al módulo
    const moduleWithSections = {
      ...module.toObject(),
      sections
    };
    
    res.json(moduleWithSections);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener módulo', 
      error: error.message 
    });
  }
});

// Crear un nuevo módulo (solo admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, courseId, order } = req.body;
    
    const module = new Module({
      title,
      description,
      courseId,
      order
    });
    
    await module.save();
    
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear módulo', 
      error: error.message 
    });
  }
});

// Actualizar un módulo (solo admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const { title, description, order } = req.body;
    
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        order,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!module) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    
    res.json(module);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar módulo', 
      error: error.message 
    });
  }
});

// Eliminar un módulo (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const module = await Module.findByIdAndDelete(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    
    // Eliminar secciones asociadas
    await Section.deleteMany({ moduleId: req.params.id });
    
    res.json({ message: 'Módulo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar módulo', 
      error: error.message 
    });
  }
});

module.exports = router;
