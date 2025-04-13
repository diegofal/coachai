import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ModuleSection.css';

const ModuleSection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [nextSection, setNextSection] = useState(null);
  const [prevSection, setPrevSection] = useState(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos de la sección
        const sectionRes = await axios.get(`/sections/${sectionId}`);
        setSection(sectionRes.data);
        
        // Obtener datos del módulo al que pertenece la sección
        const moduleRes = await axios.get(`/modules/${sectionRes.data.moduleId}`);
        setModule(moduleRes.data);
        
        // Determinar sección anterior y siguiente
        if (moduleRes.data.sections && moduleRes.data.sections.length > 0) {
          const currentIndex = moduleRes.data.sections.findIndex(s => s._id === sectionId);
          
          if (currentIndex > 0) {
            setPrevSection(moduleRes.data.sections[currentIndex - 1]);
          }
          
          if (currentIndex < moduleRes.data.sections.length - 1) {
            setNextSection(moduleRes.data.sections[currentIndex + 1]);
          }
        }
        
        // Obtener progreso del usuario para esta sección
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        if (userId) {
          const progressRes = await axios.get(`/progress/user/${userId}`);
          const sectionProgress = progressRes.data.find(p => 
            p.sectionId === sectionId && p.moduleId === sectionRes.data.moduleId
          );
          setProgress(sectionProgress);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar la sección');
        setIsLoading(false);
      }
    };
    
    fetchSection();
  }, [sectionId]);

  // Marcar sección como completada
  const markAsCompleted = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId || !section || !module) return;
      
      await axios.post('/progress', {
        moduleId: module._id,
        sectionId: section._id,
        completed: true
      });
      
      setProgress({
        ...progress,
        completed: true,
        completionDate: new Date()
      });
      
      // Si hay una siguiente sección, navegar a ella
      if (nextSection) {
        navigate(`/section/${nextSection._id}`);
      } else {
        // Si no hay siguiente sección, volver al módulo
        navigate(`/module/${module._id}`);
      }
    } catch (err) {
      console.error('Error al marcar como completado:', err);
    }
  };

  // Renderizar contenido HTML de forma segura
  const renderHTML = (html) => {
    return { __html: html };
  };

  if (isLoading) {
    return (
      <div className="section-loading">
        <div className="spinner"></div>
        <p>Cargando sección...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (!section || !module) {
    return (
      <div className="section-not-found">
        <h2>Sección no encontrada</h2>
        <p>La sección que estás buscando no existe o no tienes acceso a ella.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; 
          <Link to={`/module/${module._id}`}>{module.title}</Link> &gt; 
          <span>{section.title}</span>
        </div>
        
        <h1>{section.title}</h1>
        
        <div className="section-status">
          {progress && progress.completed ? (
            <span className="status-completed">Completado</span>
          ) : (
            <span className="status-in-progress">En progreso</span>
          )}
        </div>
      </div>
      
      <div className="section-content">
        {section.videoUrl && (
          <div className="video-container">
            <iframe 
              width="100%" 
              height="500" 
              src={section.videoUrl} 
              title={section.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        <div 
          className="content-text"
          dangerouslySetInnerHTML={renderHTML(section.content)}
        ></div>
        
        {section.resources && section.resources.length > 0 && (
          <div className="resources-section">
            <h3>Recursos Adicionales</h3>
            <ul className="resources-list">
              {section.resources.map((resource, index) => (
                <li key={index} className={`resource-item ${resource.type}`}>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {resource.title}
                  </a>
                  <span className="resource-type">{resource.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="section-navigation">
        <div className="nav-buttons">
          {prevSection ? (
            <Link to={`/section/${prevSection._id}`} className="btn btn-outline">
              &larr; Sección Anterior
            </Link>
          ) : (
            <Link to={`/module/${module._id}`} className="btn btn-outline">
              &larr; Volver al Módulo
            </Link>
          )}
          
          {progress && progress.completed ? (
            nextSection ? (
              <Link to={`/section/${nextSection._id}`} className="btn btn-primary">
                Siguiente Sección &rarr;
              </Link>
            ) : (
              <Link to={`/module/${module._id}`} className="btn btn-primary">
                Finalizar Módulo &rarr;
              </Link>
            )
          ) : (
            <button onClick={markAsCompleted} className="btn btn-primary">
              Marcar como Completado
            </button>
          )}
        </div>
        
        <div className="module-progress">
          <Link to={`/module/${module._id}`}>
            Volver a la lista de secciones
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModuleSection;
