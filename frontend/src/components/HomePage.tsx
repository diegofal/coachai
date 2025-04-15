import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

interface CourseLevel {
  id: string;
  title: string;
  price: number;
  features: string[];
  enrollPath: string;
}

const HomePage: React.FC = () => {
  const courseLevels: CourseLevel[] = [
    {
      id: 'basic',
      title: 'Nivel Básico',
      price: 299,
      features: [
        'Fundamentos del Coaching',
        'Herramientas Básicas',
        'Certificación Inicial',
        'Soporte por Email'
      ],
      enrollPath: '/enroll/basic'
    },
    {
      id: 'intermediate',
      title: 'Nivel Intermedio',
      price: 599,
      features: [
        'Todos los beneficios del Nivel Básico',
        'Herramientas Avanzadas',
        'Supervisión Grupal',
        'Soporte Prioritario'
      ],
      enrollPath: '/enroll/intermediate'
    },
    {
      id: 'advanced',
      title: 'Nivel Avanzado',
      price: 999,
      features: [
        'Todos los beneficios del Nivel Intermedio',
        'Supervisión Individual',
        'Acceso a Comunidad Premium',
        'Certificación Internacional'
      ],
      enrollPath: '/enroll/advanced'
    }
  ];

  return (
    <>
      <header>
        <div className="container header-container">
          <Link to="/" className="logo">
            Coaching<span>Academy</span>
          </Link>
          <nav>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/dashboard">Mi Dashboard</Link></li>
              <li><Link to="/courses">Cursos</Link></li>
              <li><Link to="/about">Sobre Nosotros</Link></li>
            </ul>
          </nav>
          <div className="user-dropdown">
            <div className="user-dropdown-toggle">
              <div className="user-avatar">U</div>
              <span>Usuario</span>
            </div>
            <div className="user-dropdown-menu">
              <Link to="/profile">Mi Perfil</Link>
              <Link to="/settings">Configuración</Link>
              <Link to="/logout">Cerrar Sesión</Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>Transforma tu Vida con Coaching Ontológico</h1>
            <p>Descubre el poder del autoconocimiento y la transformación personal a través de nuestro programa certificado de coaching ontológico.</p>
            <Link to="/dashboard" className="btn btn-accent">Explorar Cursos</Link>
          </div>
        </section>

        <section className="course-levels">
          <div className="container">
            <div className="section-header">
              <h2>Niveles de Certificación</h2>
              <p>Elige el nivel que mejor se adapte a tus objetivos profesionales</p>
            </div>
            <div className="levels-container">
              {courseLevels.map((level) => (
                <div key={level.id} className="level-card">
                  <h3>{level.title}</h3>
                  <div className="price">${level.price}</div>
                  <ul>
                    {level.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <Link to={level.enrollPath} className="btn btn-accent">
                    Inscribirse
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage; 