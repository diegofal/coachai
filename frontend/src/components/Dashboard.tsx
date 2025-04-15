import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

interface Module {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
}

interface Section {
  _id: string;
  title: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  modules: Module[];
}

interface Subscription {
  _id: string;
  userId: string;
  courseLevel: string;
  status: 'active' | 'inactive';
}

interface Progress {
  moduleId: string;
  completed: boolean;
  completionDate?: Date;
}

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext) as AuthContextType;
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || loading) return;

      try {
        setIsLoading(true);
        
        // Fetch courses
        const coursesRes = await axios.get<Course[]>('/courses');
        setCourses(coursesRes.data);
        
        // Fetch user's subscription
        const subscriptionRes = await axios.get<Subscription[]>(`/subscriptions/user/${user?.id}`);
        if (subscriptionRes.data.length > 0) {
          setSubscription(subscriptionRes.data[0]);
          
          // Fetch modules for the subscribed course
          const courseLevel = subscriptionRes.data[0].courseLevel;
          const course = coursesRes.data.find(c => c.level === courseLevel);
          
          if (course) {
            const courseRes = await axios.get<Course>(`/courses/${course._id}`);
            setModules(courseRes.data.modules);
          }
          
          // Fetch user's progress
          const progressRes = await axios.get<Progress[]>(`/progress/user/${user?.id}`);
          setProgress(progressRes.data);
        }
        
        setIsLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar los datos');
        } else {
          setError('Error al cargar los datos');
        }
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, loading, user]);

  const calculateOverallProgress = (): number => {
    if (!progress || !modules || modules.length === 0) return 0;
    
    const completedSections = progress.filter(p => p.completed).length;
    const totalSections = modules.reduce((total, module) => total + module.sections.length, 0);
    
    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  };

  const calculateModuleProgress = (moduleId: string): number => {
    if (!progress) return 0;
    
    const moduleSections = progress.filter(p => p.moduleId === moduleId);
    const completedSections = moduleSections.filter(p => p.completed).length;
    
    return moduleSections.length > 0 ? Math.round((completedSections / moduleSections.length) * 100) : 0;
  };

  if (loading || isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="dashboard-no-subscription">
        <h2>No tienes una suscripción activa</h2>
        <p>Para acceder al contenido del curso, debes adquirir una suscripción.</p>
        <div className="subscription-options">
          {courses.map(course => (
            <div key={course._id} className="subscription-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="price">${course.price} USD</p>
              <button className="btn btn-primary">Suscribirse</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>¡Bienvenido/a, {user?.name || 'Estudiante'}!</h1>
          <p>Continúa tu aprendizaje en coaching ontológico</p>
        </div>
        
        <div className="progress-overview">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path className="circle" strokeDasharray={`${calculateOverallProgress()}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <text x="18" y="20.35" className="percentage">{calculateOverallProgress()}%</text>
            </svg>
          </div>
          <div className="progress-info">
            <h3>Progreso General</h3>
            <p>Nivel: {subscription.courseLevel}</p>
            <p>Estado: {subscription.status === 'active' ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <h2>Tus Módulos</h2>
        
        <div className="modules-grid">
          {modules.map(module => (
            <div key={module._id} className="module-card">
              <div className="module-header">
                <h3>{module.title}</h3>
                <div className="module-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateModuleProgress(module._id)}%` }}
                    ></div>
                  </div>
                  <span>{calculateModuleProgress(module._id)}%</span>
                </div>
              </div>
              
              <p>{module.description}</p>
              
              <Link to={`/module/${module._id}`} className="btn btn-primary">
                {calculateModuleProgress(module._id) > 0 ? 'Continuar' : 'Comenzar'}
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard-sidebar">
        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          {progress && progress.length > 0 ? (
            <ul className="activity-list">
              {progress
                .filter(p => p.completed)
                .sort((a, b) => new Date(b.completionDate || 0).getTime() - new Date(a.completionDate || 0).getTime())
                .slice(0, 5)
                .map((p, index) => (
                  <li key={index} className="activity-item">
                    <div className="activity-icon">✓</div>
                    <div className="activity-details">
                      <p>Completaste una sección</p>
                      <span className="activity-date">
                        {p.completionDate ? new Date(p.completionDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="no-activity">No hay actividad reciente</p>
          )}
        </div>
        
        <div className="resources-section">
          <h3>Recursos Adicionales</h3>
          <ul className="resources-list">
            <li>
              <a href="/recursos/guia_competencias_icf.pdf" target="_blank" rel="noopener noreferrer">
                Guía de Competencias ICF
              </a>
            </li>
            <li>
              <a href="/recursos/plantilla_sesion.pdf" target="_blank" rel="noopener noreferrer">
                Plantilla para Diseño de Sesiones
              </a>
            </li>
            <li>
              <a href="https://coachingfederation.org/" target="_blank" rel="noopener noreferrer">
                Sitio Oficial de la ICF
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 