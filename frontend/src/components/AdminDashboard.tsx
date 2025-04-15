import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  level: string;
  enrolledStudents: number;
  completionRate: number;
}

interface Stats {
  totalUsers: number;
  totalCourses: number;
  activeSubscriptions: number;
  averageCompletionRate: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [usersRes, coursesRes, statsRes] = await Promise.all([
          axios.get<User[]>('/api/admin/users'),
          axios.get<Course[]>('/api/admin/courses'),
          axios.get<Stats>('/api/admin/stats')
        ]);

        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard administrativo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Administrativo</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Usuarios Totales</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Cursos Activos</h3>
            <p className="stat-number">{stats.totalCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Suscripciones Activas</h3>
            <p className="stat-number">{stats.activeSubscriptions}</p>
          </div>
          <div className="stat-card">
            <h3>Tasa de Finalización</h3>
            <p className="stat-number">{stats.averageCompletionRate}%</p>
          </div>
        </div>
      )}

      <div className="admin-content">
        <section className="users-section">
          <h2>Usuarios Recientes</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="courses-section">
          <h2>Estado de los Cursos</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Nivel</th>
                  <th>Estudiantes</th>
                  <th>Tasa de Finalización</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.level}</td>
                    <td>{course.enrolledStudents}</td>
                    <td>{course.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard; 