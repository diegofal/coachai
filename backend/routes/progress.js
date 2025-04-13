const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
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

// Obtener progreso de un usuario
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Verificar si es el propio usuario o un admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const progress = await Progress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener progreso', 
      error: error.message 
    });
  }
});

// Obtener progreso de un usuario para un módulo específico
router.get('/user/:userId/module/:moduleId', authMiddleware, async (req, res) => {
  try {
    // Verificar si es el propio usuario o un admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const progress = await Progress.find({ 
      userId: req.params.userId,
      moduleId: req.params.moduleId
    });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener progreso del módulo', 
      error: error.message 
    });
  }
});

// Registrar o actualizar progreso
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { moduleId, sectionId, completed } = req.body;
    const userId = req.user._id;
    
    // Buscar si ya existe un registro de progreso
    let progress = await Progress.findOne({
      userId,
      moduleId,
      sectionId
    });
    
    if (progress) {
      // Actualizar registro existente
      progress.completed = completed;
      if (completed && !progress.completionDate) {
        progress.completionDate = Date.now();
      }
      progress.updatedAt = Date.now();
      
      await progress.save();
    } else {
      // Crear nuevo registro
      progress = new Progress({
        userId,
        moduleId,
        sectionId,
        completed,
        completionDate: completed ? Date.now() : null
      });
      
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al registrar progreso', 
      error: error.message 
    });
  }
});

// Resetear progreso de un usuario (solo admin)
router.delete('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const result = await Progress.deleteMany({ userId: req.params.userId });
    
    res.json({ 
      message: `Progreso reseteado exitosamente. ${result.deletedCount} registros eliminados.` 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al resetear progreso', 
      error: error.message 
    });
  }
});

module.exports = router;
