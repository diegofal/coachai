import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import HomePage from './components/HomePage';
import CourseModule from './components/CourseModule';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/module/:moduleId" element={<CourseModule />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
