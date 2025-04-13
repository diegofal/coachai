import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Quiz.css';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [section, setSection] = useState(null);
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos del quiz
        const quizRes = await axios.get(`/quizzes/${quizId}`);
        setQuiz(quizRes.data);
        
        // Inicializar respuestas
        const initialAnswers = {};
        quizRes.data.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
        
        // Obtener datos de la sección asociada
        const sectionRes = await axios.get(`/sections/${quizRes.data.sectionId}`);
        setSection(sectionRes.data);
        
        // Obtener datos del módulo
        const moduleRes = await axios.get(`/modules/${sectionRes.data.moduleId}`);
        setModule(moduleRes.data);
        
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el quiz');
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  // Manejar selección de respuesta
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  };

  // Navegar a la siguiente pregunta
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navegar a la pregunta anterior
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calcular resultados
  const calculateResults = () => {
    let correctCount = 0;
    const feedbackItems = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      feedbackItems.push({
        question: question.text,
        userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Sin respuesta',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect,
        explanation: question.explanation
      });
    });
    
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setFeedback(feedbackItems);
    setShowResults(true);
    
    // Guardar resultado en la base de datos
    saveQuizResult(finalScore);
  };

  // Guardar resultado del quiz
  const saveQuizResult = async (finalScore) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId || !quiz || !section || !module) return;
      
      await axios.post('/quiz-results', {
        userId,
        quizId: quiz._id,
        sectionId: section._id,
        moduleId: module._id,
        score: finalScore,
        answers: Object.entries(answers).map(([questionIndex, answerIndex]) => ({
          questionIndex: parseInt(questionIndex),
          answerIndex: answerIndex !== null ? answerIndex : -1
        }))
      });
      
      // Marcar sección como completada si aprobó el quiz
      if (finalScore >= quiz.passingScore) {
        await axios.post('/progress', {
          userId,
          moduleId: module._id,
          sectionId: section._id,
          completed: true
        });
      }
    } catch (err) {
      console.error('Error al guardar resultado del quiz:', err);
    }
  };

  // Reiniciar quiz
  const restartQuiz = () => {
    const initialAnswers = {};
    quiz.questions.forEach((_, index) => {
      initialAnswers[index] = null;
    });
    setAnswers(initialAnswers);
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setFeedback([]);
  };

  if (isLoading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Cargando evaluación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (!quiz || !section || !module) {
    return (
      <div className="quiz-not-found">
        <h2>Evaluación no encontrada</h2>
        <p>La evaluación que estás buscando no existe o no tienes acceso a ella.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Si se están mostrando los resultados
  if (showResults) {
    const passed = score >= quiz.passingScore;
    
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="breadcrumb">
            <Link to="/dashboard">Dashboard</Link> &gt; 
            <Link to={`/module/${module._id}`}>{module.title}</Link> &gt; 
            <Link to={`/section/${section._id}`}>{section.title}</Link> &gt; 
            <span>Evaluación</span>
          </div>
          
          <h1>{quiz.title}</h1>
        </div>
        
        <div className="quiz-results">
          <div className={`results-header ${passed ? 'passed' : 'failed'}`}>
            <h2>{passed ? '¡Felicidades!' : 'Intenta nuevamente'}</h2>
            <div className="score-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path className="circle" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <text x="18" y="20.35" className="percentage">{score}%</text>
              </svg>
            </div>
            <p>
              {passed 
                ? 'Has aprobado la evaluación y completado esta sección.' 
                : `Necesitas al menos ${quiz.passingScore}% para aprobar.`}
            </p>
          </div>
          
          <div className="feedback-list">
            <h3>Revisión de Respuestas</h3>
            
            {feedback.map((item, index) => (
              <div key={index} className={`feedback-item ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-text">
                  <span className="question-number">{index + 1}.</span>
                  {item.question}
                </div>
                
                <div className="answer-review">
                  <div className="user-answer">
                    <strong>Tu respuesta:</strong> {item.userAnswer}
                    <span className={`answer-icon ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                      {item.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  {!item.isCorrect && (
                    <div className="correct-answer">
                      <strong>Respuesta correcta:</strong> {item.correctAnswer}
                    </div>
                  )}
                  
                  {item.explanation && (
                    <div className="answer-explanation">
                      <strong>Explicación:</strong> {item.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="results-actions">
            <button onClick={restartQuiz} className="btn btn-outline">
              Intentar Nuevamente
            </button>
            
            {passed ? (
              <Link to={`/module/${module._id}`} className="btn btn-primary">
                Volver al Módulo
              </Link>
            ) : (
              <Link to={`/section/${section._id}`} className="btn btn-primary">
                Repasar Contenido
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si se está mostrando el quiz
  const question = quiz.questions[currentQuestion];
  
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; 
          <Link to={`/module/${module._id}`}>{module.title}</Link> &gt; 
          <Link to={`/section/${section._id}`}>{section.title}</Link> &gt; 
          <span>Evaluación</span>
        </div>
        
        <h1>{quiz.title}</h1>
        <p className="quiz-description">{quiz.description}</p>
      </div>
      
      <div className="quiz-progress">
        <div className="progress-text">
          Pregunta {currentQuestion + 1} de {quiz.questions.length}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="question-container">
        <div className="question-text">
          <h2>{question.text}</h2>
        </div>
        
        <div className="options-list">
          {question.options.map((option, index) => (
            <div 
              key={index}
              className={`option-item ${answers[currentQuestion] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
            >
              <div className="option-marker">
                {answers[currentQuestion] === index ? '✓' : String.fromCharCode(65 + index)}
              </div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          onClick={prevQuestion} 
          className="btn btn-outline"
          disabled={currentQuestion === 0}
        >
          Anterior
        </button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button 
            onClick={nextQuestion} 
            className="btn btn-primary"
            disabled={answers[currentQuestion] === null}
          >
            Siguiente
          </button>
        ) : (
          <button 
            onClick={calculateResults} 
            className="btn btn-primary"
            disabled={answers[currentQuestion] === null}
          >
            Finalizar
          </button>
        )}
      </div>
      
      <div className="quiz-info">
        <p>
          <strong>Nota:</strong> Para aprobar esta evaluación necesitas obtener al menos {quiz.passingScore}%.
        </p>
      </div>
    </div>
  );
};

export default Quiz;
