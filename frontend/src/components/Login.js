import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(username, password);
    
    setIsLoading(false);
    
    if (success) {
      // Redirigir según el rol del usuario
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Accede a tu cuenta para continuar con tu aprendizaje</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
          <p><Link to="/">Volver al inicio</Link></p>
        </div>
      </div>
      
      <div className="login-info">
        <h3>Credenciales de Prueba</h3>
        <div className="credentials-box">
          <div className="credential-item">
            <h4>Usuario Estudiante</h4>
            <p><strong>Usuario:</strong> estudiante</p>
            <p><strong>Contraseña:</strong> curso123</p>
          </div>
          
          <div className="credential-item">
            <h4>Usuario Administrador</h4>
            <p><strong>Usuario:</strong> admin</p>
            <p><strong>Contraseña:</strong> admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
