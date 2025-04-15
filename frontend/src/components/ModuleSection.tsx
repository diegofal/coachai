import React, { useState } from 'react';

interface Section {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  quizId?: string;
  completed: boolean;
}

interface ModuleSectionProps {
  section: Section;
  onComplete: () => Promise<void>;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({ section, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`section-card ${section.completed ? 'completed' : ''}`}>
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>{section.title}</h3>
        <div className="section-status">
          {section.completed ? (
            <span className="completed-badge">✓ Completado</span>
          ) : (
            <span className="pending-badge">Pendiente</span>
          )}
          <button 
            className={`expand-button ${isExpanded ? 'expanded' : ''}`}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="section-content">
          {section.videoUrl && (
            <div className="video-container">
              <iframe
                src={section.videoUrl}
                title={section.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="content-text">
            {section.content}
          </div>

          {section.quizId && (
            <div className="quiz-section">
              <h4>Evaluación</h4>
              <p>Esta sección incluye una evaluación que debes completar.</p>
              <button className="btn btn-secondary">
                Iniciar Evaluación
              </button>
            </div>
          )}

          {!section.completed && (
            <button
              className="btn btn-primary complete-button"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? 'Marcando como completado...' : 'Marcar como completado'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleSection; 