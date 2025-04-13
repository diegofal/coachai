import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CourseModule from './components/CourseModule';
import ModuleSection from './components/ModuleSection';
import Quiz from './components/Quiz';
import NotFound from './components/NotFound';
import HomePage from './components/HomePage';

// Contexto de autenticación
import { AuthProvider } from './context/AuthContext';

// Configuración de axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/module/:moduleId" 
                element={
                  <ProtectedRoute>
                    <CourseModule />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/section/:sectionId" 
                element={
                  <ProtectedRoute>
                    <ModuleSection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth({
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setAuth({
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  if (auth.isLoading) {
    return <div>Cargando...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Componente para rutas de administrador
const AdminRoute = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      setAuth({
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false
      });
    } else {
      setAuth({
        isAuthenticated: !!token,
        isAdmin: false,
        isLoading: false
      });
    }
  }, []);

  if (auth.isLoading) {
    return <div>Cargando...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default App;
