import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ModuleSection from './ModuleSection';

interface Section {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  quizId?: string;
  completed: boolean;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
}

const CourseModule: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Module>(`/api/modules/${moduleId}`);
        setModule(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el módulo. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  const handleSectionComplete = async (sectionId: string) => {
    try {
      await axios.post(`/api/progress/section/${sectionId}/complete`);
      
      // Update local state to reflect completion
      if (module) {
        setModule({
          ...module,
          sections: module.sections.map(section => 
            section._id === sectionId 
              ? { ...section, completed: true }
              : section
          )
        });
      }
    } catch (err) {
      console.error('Error marking section as complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="module-loading">
        <div className="spinner"></div>
        <p>Cargando módulo...</p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="module-error">
        <h2>Error</h2>
        <p>{error || 'No se pudo encontrar el módulo.'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h1>{module.title}</h1>
        <p>{module.description}</p>
      </div>

      <div className="module-content">
        {module.sections.map((section) => (
          <ModuleSection
            key={section._id}
            section={section}
            onComplete={() => handleSectionComplete(section._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseModule; 