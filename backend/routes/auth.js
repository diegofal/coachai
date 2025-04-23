const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware para verificar token
const auth = async (req, res, next) => {
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

// Ruta para registro de usuarios
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'El usuario o email ya está registrado' 
      });
    }
    
    // Crear nuevo usuario
    const user = new User({
      name,
      username,
      email,
      password,
      role: 'student'
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al registrar usuario', 
      error: error.message 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Ruta para obtener datos del usuario actual
router.get('/user', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      registrationDate: req.user.registrationDate,
      lastLogin: req.user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener datos del usuario', 
      error: error.message 
    });
  }
});

// Ruta para cerrar sesión
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al cerrar sesión', 
      error: error.message 
    });
  }
});

module.exports = router;
