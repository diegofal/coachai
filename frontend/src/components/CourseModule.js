import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/CourseModule.css';

const CourseModule = () => {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del módulo
        const moduleRes = await axios.get(`/modules/${moduleId}`);
        setModule(moduleRes.data);
        
        // Obtener progreso del usuario para este módulo
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        if (userId) {
          const progressRes = await axios.get(`/progress/user/${userId}`);
          const moduleProgress = progressRes.data.filter(p => p.moduleId === moduleId);
          setProgress(moduleProgress);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el módulo');
        setIsLoading(false);
      }
    };
    
    fetchModule();
  }, [moduleId]);

  // Verificar si una sección está completada
  const isSectionCompleted = (sectionId) => {
    return progress.some(p => p.sectionId === sectionId && p.completed);
  };

  // Calcular progreso del módulo
  const calculateModuleProgress = () => {
    if (!module || !module.sections || module.sections.length === 0) return 0;
    
    const completedSections = progress.filter(p => p.completed).length;
    return Math.round((completedSections / module.sections.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="module-loading">
        <div className="spinner"></div>
        <p>Cargando módulo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="module-not-found">
        <h2>Módulo no encontrado</h2>
        <p>El módulo que estás buscando no existe o no tienes acceso a él.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title">
          <h1>{module.title}</h1>
          <p>{module.description}</p>
        </div>
        
        <div className="module-progress">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path className="circle" strokeDasharray={`${calculateModuleProgress()}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <text x="18" y="20.35" className="percentage">{calculateModuleProgress()}%</text>
            </svg>
          </div>
          <p>Progreso del módulo</p>
        </div>
      </div>
      
      <div className="module-content">
        <h2>Secciones del Módulo</h2>
        
        <div className="sections-list">
          {module.sections.map((section, index) => (
            <div 
              key={section._id} 
              className={`section-item ${isSectionCompleted(section._id) ? 'completed' : ''}`}
            >
              <div className="section-number">{index + 1}</div>
              <div className="section-info">
                <h3>{section.title}</h3>
                <div className="section-meta">
                  {section.videoUrl && <span className="meta-item video">Video</span>}
                  {section.resources && section.resources.length > 0 && (
                    <span className="meta-item resources">{section.resources.length} recursos</span>
                  )}
                </div>
              </div>
              <div className="section-status">
                {isSectionCompleted(section._id) ? (
                  <span className="status-completed">Completado</span>
                ) : (
                  <span className="status-pending">Pendiente</span>
                )}
              </div>
              <Link to={`/section/${section._id}`} className="btn btn-secondary">
                {isSectionCompleted(section._id) ? 'Repasar' : 'Comenzar'}
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="module-navigation">
        <Link to="/dashboard" className="btn btn-outline">
          Volver al Dashboard
        </Link>
        
        {module.sections && module.sections.length > 0 && (
          <Link to={`/section/${module.sections[0]._id}`} className="btn btn-primary">
            Comenzar Módulo
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseModule;
