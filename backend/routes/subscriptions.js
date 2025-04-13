const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
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

// Obtener suscripciones del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener suscripciones', 
      error: error.message 
    });
  }
});

// Crear una nueva suscripción
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseLevel, paymentInfo } = req.body;
    const userId = req.user._id;
    
    // Verificar si ya existe una suscripción activa para este nivel
    const existingSubscription = await Subscription.findOne({
      userId,
      courseLevel,
      status: 'active'
    });
    
    if (existingSubscription) {
      return res.status(400).json({ 
        message: 'Ya tienes una suscripción activa para este nivel de curso' 
      });
    }
    
    // Calcular fecha de finalización (1 año después)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    // Crear nueva suscripción
    const subscription = new Subscription({
      userId,
      courseLevel,
      status: 'active',
      startDate: Date.now(),
      endDate,
      paymentInfo
    });
    
    await subscription.save();
    
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear suscripción', 
      error: error.message 
    });
  }
});

// Cancelar una suscripción
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    
    // Verificar si es el propietario o un admin
    if (subscription.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Actualizar estado
    subscription.status = 'cancelled';
    subscription.updatedAt = Date.now();
    
    await subscription.save();
    
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al cancelar suscripción', 
      error: error.message 
    });
  }
});

// Renovar una suscripción
router.put('/:id/renew', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    }
    
    // Verificar si es el propietario o un admin
    if (subscription.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Calcular nueva fecha de finalización (1 año después)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    // Actualizar suscripción
    subscription.status = 'active';
    subscription.startDate = Date.now();
    subscription.endDate = endDate;
    subscription.updatedAt = Date.now();
    
    if (req.body.paymentInfo) {
      subscription.paymentInfo = req.body.paymentInfo;
    }
    
    await subscription.save();
    
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al renovar suscripción', 
      error: error.message 
    });
  }
});

// Verificar acceso a un nivel de curso
router.get('/access/:level', authMiddleware, async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    
    // Los administradores tienen acceso a todos los niveles
    if (req.user.role === 'admin') {
      return res.json({ hasAccess: true });
    }
    
    // Buscar suscripción activa para este nivel o superior
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      courseLevel: { $gte: level },
      status: 'active',
      endDate: { $gt: Date.now() }
    });
    
    res.json({ hasAccess: !!subscription });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al verificar acceso', 
      error: error.message 
    });
  }
});

module.exports = router;
