import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener usuarios
        const usersRes = await axios.get('/admin/users');
        setUsers(usersRes.data);
        
        // Obtener suscripciones
        const subscriptionsRes = await axios.get('/subscriptions');
        setSubscriptions(subscriptionsRes.data);
        
        // Obtener cursos
        const coursesRes = await axios.get('/courses');
        setCourses(coursesRes.data);
        
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los datos');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar usuarios según búsqueda y filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si no hay filtros activos, solo aplicar búsqueda
    if (courseFilter === 'all' && statusFilter === 'all') {
      return matchesSearch;
    }
    
    // Obtener suscripción del usuario
    const userSubscription = subscriptions.find(sub => sub.userId === user._id);
    
    // Aplicar filtro de curso
    const matchesCourse = courseFilter === 'all' || 
      (userSubscription && userSubscription.courseLevel.toString() === courseFilter);
    
    // Aplicar filtro de estado
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Obtener estadísticas
  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    
    const courseStats = [1, 2, 3].map(level => {
      const count = subscriptions.filter(sub => sub.courseLevel === level).length;
      return { level, count };
    });
    
    return { totalUsers, activeUsers, courseStats };
  };

  // Abrir modal para ver detalles de usuario
  const openUserDetails = (user) => {
    setSelectedUser(user);
    setModalType('details');
    setIsModalOpen(true);
  };

  // Abrir modal para editar usuario
  const openEditUser = (user) => {
    setSelectedUser(user);
    setModalType('edit');
    setIsModalOpen(true);
  };

  // Abrir modal para confirmar eliminación
  const openDeleteConfirmation = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalType('');
  };

  // Actualizar usuario
  const updateUser = async (updatedUser) => {
    try {
      await axios.put(`/admin/users/${updatedUser._id}`, updatedUser);
      
      // Actualizar lista de usuarios
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      
      // Actualizar lista de usuarios
      setUsers(users.filter(user => user._id !== userId));
      
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  // Obtener suscripción de un usuario
  const getUserSubscription = (userId) => {
    return subscriptions.find(sub => sub.userId === userId);
  };

  // Obtener nombre del curso según nivel
  const getCourseName = (level) => {
    const course = courses.find(c => c.level === level);
    return course ? course.title : `Nivel ${level}`;
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Cargando panel de administración...</p>
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

  const stats = getStats();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios, suscripciones y contenido del curso</p>
      </div>
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Usuarios Totales</h3>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        
        <div className="stat-card">
          <h3>Usuarios Activos</h3>
          <div className="stat-value">{stats.activeUsers}</div>
        </div>
        
        {stats.courseStats.map(stat => (
          <div key={stat.level} className="stat-card">
            <h3>Nivel {stat.level}</h3>
            <div className="stat-value">{stat.count}</div>
          </div>
        ))}
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Suscripciones
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Contenido
        </button>
      </div>
      
      {activeTab === 'users' && (
        <div className="users-tab">
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-select">
              <label htmlFor="course-filter">Curso:</label>
              <select 
                id="course-filter" 
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
              </select>
            </div>
            
            <div className="filter-select">
              <label htmlFor="status-filter">Estado:</label>
              <select 
                id="status-filter" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre de Usuario</th>
                  <th>Curso</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const subscription = getUserSubscription(user._id);
                  const courseLevel = subscription ? subscription.courseLevel : null;
                  
                  return (
                    <tr key={user._id} className={user.status === 'inactive' ? 'inactive-user' : ''}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{user.name.charAt(0)}</div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.username}</td>
                      <td>{courseLevel ? getCourseName(courseLevel) : 'Sin suscripción'}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => openUserDetails(user)}
                        >
                          Ver
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => openEditUser(user)}
                        >
                          Editar
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => openDeleteConfirmation(user)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'subscriptions' && (
        <div className="subscriptions-tab">
          <h2>Gestión de Suscripciones</h2>
          
          <div className="subscriptions-table-container">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nivel de Curso</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(subscription => {
                  const user = users.find(u => u._id === subscription.userId);
                  
                  return (
                    <tr key={subscription._id}>
                      <td>
                        {user ? (
                          <div className="user-info">
                            <div className="user-avatar">{user.name.charAt(0)}</div>
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        ) : (
                          'Usuario no encontrado'
                        )}
                      </td>
                      <td>{getCourseName(subscription.courseLevel)}</td>
                      <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                      <td>
                        {subscription.endDate 
                          ? new Date(subscription.endDate).toLocaleDateString() 
                          : 'Sin fecha de fin'
                        }
                      </td>
                      <td>
                        <span className={`status-badge ${subscription.status}`}>
                          {subscription.status === 'active' ? 'Activa' : 
                           subscription.status === 'expired' ? 'Expirada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn view-btn">Ver</button>
                        <button className="action-btn edit-btn">Editar</button>
                        <button className="action-btn delete-btn">Cancelar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'content' && (
        <div className="content-tab">
          <h2>Gestión de Contenido</h2>
          
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span className="course-level">Nivel {course.level}</span>
                  <span className="course-price">${course.price} USD</span>
                </div>
                <div className="course-modules">
                  <h4>Módulos: {course.modules.length}</h4>
                  <Link to={`/admin/course/${course._id}`} className="btn btn-primary">
                    Gestionar Contenido
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Modal para detalles, edición y eliminación de usuarios */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            {modalType === 'details' && (
              <>
                <div className="modal-header">
                  <h2>Detalles del Usuario</h2>
                  <button className="modal-close" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="user-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nombre:</span>
                      <span className="detail-value">{selectedUser.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Nombre de Usuario:</span>
                      <span className="detail-value">{selectedUser.username}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Rol:</span>
                      <span className="detail-value">{selectedUser.role}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Estado:</span>
                      <span className="detail-value">
                        <span className={`status-badge ${selectedUser.status}`}>
                          {selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fecha de Registro:</span>
                      <span className="detail-value">
                        {new Date(selectedUser.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Último Acceso:</span>
                      <span className="detail-value">
                        {selectedUser.lastLogin 
                          ? new Date(selectedUser.lastLogin).toLocaleDateString() 
                          : 'Nunca'
                        }
                      </span>
                    </div>
                    
                    {/* Información de suscripción */}
                    <div className="detail-item subscription-detail">
                      <span className="detail-label">Suscripción:</span>
                      <span className="detail-value">
                        {(() => {
                          const subscription = getUserSubscription(selectedUser._id);
                          if (!subscription) return 'Sin suscripción';
                          
                          return (
                            <div className="subscription-info">
                              <div>{getCourseName(subscription.courseLevel)}</div>
                              <div>Estado: {subscription.status}</div>
                              <div>
                                Desde: {new Date(subscription.startDate).toLocaleDateString()}
                              </div>
                              {subscription.endDate && (
                                <div>
                                  Hasta: {new Date(subscription.endDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={closeModal}>Cerrar</button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      closeModal();
                      openEditUser(selectedUser);
                    }}
                  >
                    Editar Usuario
                  </button>
                </div>
              </>
            )}
            
            {modalType === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Editar Usuario</h2>
                  <button className="modal-close" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  <form id="edit-user-form" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const updatedUser = {
                      ...selectedUser,
                      name: formData.get('name'),
                      email: formData.get('email'),
                      role: formData.get('role'),
                      status: formData.get('status')
                    };
                    updateUser(updatedUser);
                  }}>
                    <div className="form-group">
                      <label htmlFor="name">Nombre</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        defaultValue={selectedUser.name}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        defaultValue={selectedUser.email}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="role">Rol</label>
                      <select 
                        id="role" 
                        name="role" 
                        defaultValue={selectedUser.role}
                      >
                        <option value="student">Estudiante</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="status">Estado</label>
                      <select 
                        id="status" 
                        name="status" 
                        defaultValue={selectedUser.status}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit"
                    form="edit-user-form"
                    className="btn btn-primary"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </>
            )}
            
            {modalType === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>Confirmar Eliminación</h2>
                  <button className="modal-close" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  <p>¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.name}</strong>?</p>
                  <p>Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario, incluyendo suscripciones y progreso.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => deleteUser(selectedUser._id)}
                  >
                    Eliminar Usuario
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
