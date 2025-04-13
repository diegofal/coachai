const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Progress = require('../models/Progress');
const QuizResult = require('../models/QuizResult');
const jwt = require('jsonwebtoken');

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

// Middleware para verificar si es admin
const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

// Obtener todos los usuarios (solo admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener usuarios', 
      error: error.message 
    });
  }
});

// Obtener un usuario por ID (solo admin)
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener usuario', 
      error: error.message 
    });
  }
});

// Actualizar un usuario (solo admin)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        status
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar usuario', 
      error: error.message 
    });
  }
});

// Eliminar un usuario (solo admin)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Eliminar datos asociados
    await Subscription.deleteMany({ userId: req.params.id });
    await Progress.deleteMany({ userId: req.params.id });
    await QuizResult.deleteMany({ userId: req.params.id });
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar usuario', 
      error: error.message 
    });
  }
});

// Obtener todas las suscripciones (solo admin)
router.get('/subscriptions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('userId', 'name email');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener suscripciones', 
      error: error.message 
    });
  }
});

// Obtener estadísticas generales (solo admin)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Contar usuarios
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // Contar suscripciones por nivel
    const level1Subscriptions = await Subscription.countDocuments({ 
      courseLevel: 1, 
      status: 'active' 
    });
    const level2Subscriptions = await Subscription.countDocuments({ 
      courseLevel: 2, 
      status: 'active' 
    });
    const level3Subscriptions = await Subscription.countDocuments({ 
      courseLevel: 3, 
      status: 'active' 
    });
    
    // Obtener usuarios recientes
    const recentUsers = await User.find()
      .sort({ registrationDate: -1 })
      .limit(5)
      .select('name email registrationDate');
    
    // Obtener suscripciones recientes
    const recentSubscriptions = await Subscription.find()
      .sort({ startDate: -1 })
      .limit(5)
      .populate('userId', 'name email');
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers
      },
      subscriptions: {
        level1: level1Subscriptions,
        level2: level2Subscriptions,
        level3: level3Subscriptions,
        total: level1Subscriptions + level2Subscriptions + level3Subscriptions
      },
      recent: {
        users: recentUsers,
        subscriptions: recentSubscriptions
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
});

module.exports = router;
