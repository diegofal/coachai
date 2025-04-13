import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Crear contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null
  });

  // Verificar token al cargar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null
        });
        return;
      }
      
      try {
        // Configurar token en headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Obtener información del usuario
        const res = await axios.get('/auth/user');
        
        setAuthState({
          isAuthenticated: true,
          user: res.data,
          token,
          loading: false,
          error: null
        });
      } catch (err) {
        // Limpiar token si es inválido
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: err.response?.data?.message || 'Error de autenticación'
        });
      }
    };
    
    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      const res = await axios.post('/auth/login', { username, password });
      
      // Guardar token en localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      
      // Configurar token en headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setAuthState({
        isAuthenticated: true,
        user: res.data.user,
        token: res.data.token,
        loading: false,
        error: null
      });
      
      return true;
    } catch (err) {
      setAuthState({
        ...authState,
        error: err.response?.data?.message || 'Error al iniciar sesión'
      });
      
      return false;
    }
  };

  // Función para registrarse
  const register = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      
      setAuthState({
        ...authState,
        error: null
      });
      
      return { success: true, message: res.data.message };
    } catch (err) {
      setAuthState({
        ...authState,
        error: err.response?.data?.message || 'Error al registrarse'
      });
      
      return { success: false, message: err.response?.data?.message || 'Error al registrarse' };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Limpiar headers
    delete axios.defaults.headers.common['Authorization'];
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });
  };

  // Función para limpiar errores
  const clearError = () => {
    setAuthState({
      ...authState,
      error: null
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
