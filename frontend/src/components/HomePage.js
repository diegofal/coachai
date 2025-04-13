import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('nivel1');

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Curso de Coaching Ontológico</h1>
          <p className="hero-subtitle">Basado en los estándares de la ICF para certificación profesional</p>
          <div className="hero-buttons">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn btn-primary">Ir a mi Dashboard</Link>
            ) : (
              <>
                <button onClick={toggleLoginModal} className="btn btn-primary">Iniciar Sesión</button>
                <Link to="/register" className="btn btn-outline">Registrarse</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <img src="/images/coaching-hero.jpg" alt="Coaching Ontológico" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>¿Por qué elegir nuestro curso?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Contenido Completo</h3>
            <p>Módulos detallados que cubren todos los aspectos del coaching ontológico según los estándares de la ICF.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Certificación Profesional</h3>
            <p>Preparación completa para obtener la certificación de la International Coach Federation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Recursos Multimedia</h3>
            <p>Videos de conversaciones completas de coaching y recursos adicionales para un aprendizaje integral.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Evaluación Avanzada</h3>
            <p>Quizzes y ejercicios de reflexión que refuerzan el aprendizaje y evalúan tu progreso.</p>
          </div>
        </div>
      </section>

      {/* Course Levels Section */}
      <section className="course-levels-section">
        <h2>Niveles del Curso</h2>
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'nivel1' ? 'active' : ''}`}
            onClick={() => setActiveTab('nivel1')}
          >
            Nivel 1: Fundamentos
          </button>
          <button 
            className={`tab-button ${activeTab === 'nivel2' ? 'active' : ''}`}
            onClick={() => setActiveTab('nivel2')}
          >
            Nivel 2: Práctica
          </button>
          <button 
            className={`tab-button ${activeTab === 'nivel3' ? 'active' : ''}`}
            onClick={() => setActiveTab('nivel3')}
          >
            Nivel 3: Maestría
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'nivel1' && (
            <div className="level-content">
              <div className="level-info">
                <h3>Fundamentos del Coaching Ontológico</h3>
                <p className="level-price">$497 USD</p>
                <p className="level-description">
                  Introducción completa al coaching ontológico, sus principios fundamentales y las competencias básicas según la ICF.
                </p>
                <ul className="level-features">
                  <li>Introducción al coaching ontológico</li>
                  <li>Los tres dominios del ser humano</li>
                  <li>Competencias fundamentales del coach</li>
                  <li>Herramientas básicas de coaching</li>
                  <li>Prácticas iniciales y reflexión</li>
                  <li>Evaluación de competencias básicas</li>
                </ul>
                <button className="btn btn-primary">Suscribirse a Nivel 1</button>
              </div>
              <div className="level-modules">
                <h4>Módulos Incluidos:</h4>
                <div className="module-list">
                  <div className="module-item">
                    <span className="module-number">1</span>
                    <span className="module-title">Introducción al Coaching Ontológico</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">2</span>
                    <span className="module-title">Los Tres Dominios del Ser</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">3</span>
                    <span className="module-title">Competencias Fundamentales ICF</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">4</span>
                    <span className="module-title">Herramientas Básicas de Coaching</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">5</span>
                    <span className="module-title">Prácticas Iniciales</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">6</span>
                    <span className="module-title">Evaluación de Competencias</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'nivel2' && (
            <div className="level-content">
              <div className="level-info">
                <h3>Práctica del Coaching Ontológico</h3>
                <p className="level-price">$997 USD</p>
                <p className="level-description">
                  Profundización en las técnicas y metodologías del coaching ontológico con enfoque práctico y supervisado.
                </p>
                <ul className="level-features">
                  <li>Diseño de conversaciones poderosas</li>
                  <li>Escucha activa y preguntas potentes</li>
                  <li>Gestión de emociones y corporalidad</li>
                  <li>Modelos mentales y creencias limitantes</li>
                  <li>Prácticas supervisadas</li>
                  <li>Evaluación de competencias intermedias</li>
                </ul>
                <button className="btn btn-primary">Suscribirse a Nivel 2</button>
              </div>
              <div className="level-modules">
                <h4>Módulos Incluidos:</h4>
                <div className="module-list">
                  <div className="module-item">
                    <span className="module-number">1</span>
                    <span className="module-title">Diseño de Conversaciones Poderosas</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">2</span>
                    <span className="module-title">Escucha Activa y Preguntas Potentes</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">3</span>
                    <span className="module-title">Gestión de Emociones y Corporalidad</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">4</span>
                    <span className="module-title">Modelos Mentales y Creencias</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">5</span>
                    <span className="module-title">Prácticas Supervisadas</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">6</span>
                    <span className="module-title">Evaluación de Competencias Intermedias</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'nivel3' && (
            <div className="level-content">
              <div className="level-info">
                <h3>Maestría en Coaching Ontológico</h3>
                <p className="level-price">$2,497 USD</p>
                <p className="level-description">
                  Nivel avanzado para dominar el arte del coaching ontológico y prepararse para la certificación profesional.
                </p>
                <ul className="level-features">
                  <li>Coaching ontológico avanzado</li>
                  <li>Diseño de intervenciones transformadoras</li>
                  <li>Coaching para liderazgo y organizaciones</li>
                  <li>Ética profesional y estándares ICF</li>
                  <li>Supervisión y mentoring</li>
                  <li>Preparación para certificación ICF</li>
                </ul>
                <button className="btn btn-primary">Suscribirse a Nivel 3</button>
              </div>
              <div className="level-modules">
                <h4>Módulos Incluidos:</h4>
                <div className="module-list">
                  <div className="module-item">
                    <span className="module-number">1</span>
                    <span className="module-title">Coaching Ontológico Avanzado</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">2</span>
                    <span className="module-title">Intervenciones Transformadoras</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">3</span>
                    <span className="module-title">Coaching para Liderazgo</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">4</span>
                    <span className="module-title">Ética Profesional y Estándares ICF</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">5</span>
                    <span className="module-title">Supervisión y Mentoring</span>
                  </div>
                  <div className="module-item">
                    <span className="module-number">6</span>
                    <span className="module-title">Preparación para Certificación</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Lo que dicen nuestros estudiantes</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Este curso transformó mi comprensión del coaching ontológico. Los recursos multimedia y las evaluaciones me ayudaron a integrar los conceptos de manera profunda."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">MR</div>
              <div className="author-info">
                <h4>María Rodríguez</h4>
                <p>Coach Certificada</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"La estructura del curso es excelente. Pude avanzar a mi propio ritmo y los videos de conversaciones reales fueron invaluables para mi aprendizaje."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">JL</div>
              <div className="author-info">
                <h4>Juan López</h4>
                <p>Consultor de Empresas</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Las evaluaciones son desafiantes y realmente te hacen reflexionar. El contenido está perfectamente alineado con los estándares de la ICF."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">AG</div>
              <div className="author-info">
                <h4>Ana García</h4>
                <p>Directora de RRHH</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>¿Este curso me prepara para la certificación ICF?</h3>
            <p>Sí, el curso está diseñado siguiendo los estándares de la International Coach Federation (ICF) y te prepara para el proceso de certificación, especialmente el Nivel 3.</p>
          </div>
          <div className="faq-item">
            <h3>¿Cuánto tiempo tengo acceso al curso?</h3>
            <p>Una vez suscrito, tienes acceso ilimitado al nivel correspondiente del curso. Puedes avanzar a tu propio ritmo.</p>
          </div>
          <div className="faq-item">
            <h3>¿Necesito conocimientos previos?</h3>
            <p>El Nivel 1 está diseñado para principiantes y no requiere conocimientos previos. Para los Niveles 2 y 3, se recomienda haber completado los niveles anteriores.</p>
          </div>
          <div className="faq-item">
            <h3>¿Hay algún tipo de certificado al finalizar?</h3>
            <p>Sí, al completar cada nivel recibirás un certificado digital. El Nivel 3 incluye preparación específica para la certificación oficial de la ICF.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Comienza tu camino en el Coaching Ontológico</h2>
        <p>Únete a nuestra comunidad de coaches y transforma tu carrera profesional</p>
        <div className="cta-buttons">
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary">Ir a mi Dashboard</Link>
          ) : (
            <>
              <button onClick={toggleLoginModal} className="btn btn-primary">Iniciar Sesión</button>
              <Link to="/register" className="btn btn-outline">Registrarse</Link>
            </>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Iniciar Sesión</h2>
              <button className="modal-close" onClick={toggleLoginModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="username">Nombre de Usuario</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Ingresa tu nombre de usuario"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
              </form>
              <div className="login-options">
                <p>¿No tienes una cuenta? <Link to="/register" onClick={toggleLoginModal}>Regístrate</Link></p>
              </div>
              <div className="test-credentials">
                <h4>Credenciales de Prueba</h4>
                <div className="credentials-box">
                  <div className="credential-item">
                    <p><strong>Usuario:</strong> estudiante</p>
                    <p><strong>Contraseña:</strong> curso123</p>
                  </div>
                  <div className="credential-item">
                    <p><strong>Usuario:</strong> admin</p>
                    <p><strong>Contraseña:</strong> admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
