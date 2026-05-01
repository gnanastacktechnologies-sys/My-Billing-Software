import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/projects/CreateProject';
import InProgress from './pages/projects/InProgress';
import Completed from './pages/projects/Completed';
import ProjectManagementSystem from './pages/projects/ProjectManagementSystem';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="projects">
            <Route path="create" element={<CreateProject />} />
            <Route path="in-progress" element={<InProgress />} />
            <Route path="completed" element={<Completed />} />
            <Route path="current" element={<ProjectManagementSystem />} />
          </Route>

          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
