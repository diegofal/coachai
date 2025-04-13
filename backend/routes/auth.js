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

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }
    
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }
    
    // Actualizar último login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generar token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al iniciar sesión', 
      error: error.message 
    });
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
